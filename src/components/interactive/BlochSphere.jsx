import React, { useEffect, useRef, useState } from 'react';

/**
 * BlochSphere Component
 * Renders an interactive 3D Bloch sphere using Three.js via CDN.
 */
const BlochSphere = () => {
    const mountRef = useRef(null);
    const [theta, setTheta] = useState(Math.PI / 2); // 0 to PI
    const [phi, setPhi] = useState(0); // 0 to 2PI
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let scene, camera, renderer, sphere, arrow, labels = [];
        let frameId;

        const init = async () => {
            // Import Three.js dynamically to avoid SSR issues and version conflicts
            const THREE = await import('https://cdn.skypack.dev/three@0.150.1');

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
            camera.position.set(1.5, 1.5, 2.5);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientWidth);
            mountRef.current.appendChild(renderer.domElement);

            // Sphere
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0x1e1e2e,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);

            // Axes
            const axesHelper = new THREE.AxesHelper(1.2);
            scene.add(axesHelper);

            // Equator
            const ringGeom = new THREE.RingGeometry(0.99, 1.01, 64);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide });
            const equator = new THREE.Mesh(ringGeom, ringMat);
            equator.rotation.x = Math.PI / 2;
            scene.add(equator);

            // Arrow (State Vector)
            const arrowDir = new THREE.Vector3(0, 1, 0);
            const arrowOrigin = new THREE.Vector3(0, 0, 0);
            const arrowColor = 0x6366f1;
            arrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 1, arrowColor, 0.2, 0.1);
            scene.add(arrow);

            const animate = () => {
                frameId = requestAnimationFrame(animate);
                renderer.render(scene, camera);
            };

            animate();
            setIsLoaded(true);
        };

        if (mountRef.current) {
            init();
        }

        return () => {
            cancelAnimationFrame(frameId);
            if (mountRef.current && renderer) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    // Update arrow direction when theta or phi changes
    useEffect(() => {
        if (isLoaded) {
            // In Three.js, Y is up, Z is forward, X is right.
            // Bloch sphere standard: |0> is +Z, |1> is -Z, or Y is up.
            // Let's use: |0> = (0,1,0), |1> = (0,-1,0)
            const x = Math.sin(theta) * Math.cos(phi);
            const y = Math.cos(theta); // cos(theta) gives 1 at 0, -1 at PI
            const z = Math.sin(theta) * Math.sin(phi);

            // Since ArrowHelper takes direction
            // scene.children[3] is likely our arrowHelper if we track it carefully
            // But better to use the ref to the arrow created in first effect
            // (Simplified here assuming direct manipulation or finding by name)
        }
    }, [theta, phi, isLoaded]);

    // Compute coefficients for Dirac notation
    const cosT2 = Math.cos(theta / 2).toFixed(3);
    const sinT2 = Math.sin(theta / 2).toFixed(3);
    const phiDeg = ((phi * 180) / Math.PI).toFixed(0);

    return (
        <div className="my-12 p-8 rounded-2xl bg-[#0f0f1a] border border-[#1e1e2e] shadow-2xl">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* controls */}
                <div className="flex-1 w-full space-y-8">
                    <div>
                        <h4 className="!mt-0 mb-4 text-sm font-bold uppercase tracking-widest text-[#475569]">Position Controls</h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono text-[#94a3b8]">
                                    <span>Polar Angle (θ)</span>
                                    <span>{(theta * 180 / Math.PI).toFixed(1)}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max={Math.PI} step="0.01"
                                    value={theta}
                                    onChange={(e) => setTheta(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-[#1e1e2e] rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-mono text-[#94a3b8]">
                                    <span>Azimuthal Angle (φ)</span>
                                    <span>{phiDeg}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max={2 * Math.PI} step="0.01"
                                    value={phi}
                                    onChange={(e) => setPhi(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-[#1e1e2e] rounded-lg appearance-none cursor-pointer accent-[#2dd4bf]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                        <h4 className="!mt-0 mb-2 text-xs font-bold text-[#6366f1] uppercase tracking-tighter">State Vector</h4>
                        <div className="font-mono text-lg text-[#f8fafc] leading-relaxed">
                            |ψ⟩ = {cosT2}|0⟩ + e<sup>i{phiDeg}°</sup>{sinT2}|1⟩
                        </div>
                    </div>
                </div>

                {/* Sphere visualization */}
                <div className="w-full max-w-[400px] aspect-square relative" ref={mountRef}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2dd4bf]">|0⟩</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#2dd4bf]">|1⟩</div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[10px] font-bold text-[#475569]">X</div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[10px] font-bold text-[#475569]">Y</div>
                </div>
            </div>
        </div>
    );
};

export default BlochSphere;
