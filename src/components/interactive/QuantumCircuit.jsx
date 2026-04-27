import React, { useState } from 'react';

const GATE_COLORS = {
    H: '#6366f1', // indigo
    X: '#6366f1',
    Y: '#6366f1',
    Z: '#6366f1',
    S: '#818cf8',
    T: '#818cf8',
    CNOT: '#2dd4bf', // teal
    M: '#475569',   // gray
};

const GATE_MATRICES = {
    H: '[[1, 1], [1, -1]] / √2',
    X: '[[0, 1], [1, 0]]',
    Y: '[[0, -i], [i, 0]]',
    Z: '[[1, 0], [0, -1]]',
    CNOT: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]',
};

const QuantumCircuit = ({ circuit = [] }) => {
    const [showUnitary, setShowUnitary] = useState(false);
    const numQubits = Math.max(0, ...circuit.map(g => g.qubit || 0), ...circuit.map(g => g.target || 0)) + 1;
    const numSteps = circuit.length + 1;

    const wireHeight = 60;
    const stepWidth = 80;
    const padding = 40;

    const width = numSteps * stepWidth + padding * 2;
    const height = numQubits * wireHeight + padding * 2;

    const downloadSVG = () => {
        const svgData = document.getElementById('quantum-circuit-svg').outerHTML;
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'quaniq-circuit.svg';
        link.click();
    };

    return (
        <div className="my-12 p-8 rounded-2xl bg-[#0f0f1a] border border-[#1e1e2e]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h4 className="!m-0 text-sm font-bold text-[#f8fafc] uppercase tracking-widest">Quantum Circuit</h4>
                    <p className="text-xs text-[#475569] mt-1">Interactive architectural visualization</p>
                </div>
                <button
                    onClick={downloadSVG}
                    className="px-3 py-1.5 rounded bg-[#1e1e2e] text-[10px] font-bold text-[#94a3b8] hover:text-[#f8fafc] transition-colors border border-[#1e1e2e]"
                >
                    EXPORT SVG
                </button>
            </div>

            <div className="overflow-x-auto pb-4">
                <svg id="quantum-circuit-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    {/* Wires */}
                    {Array.from({ length: numQubits }).map((_, i) => (
                        <g key={`wire-${i}`}>
                            <text x="10" y={padding + i * wireHeight + 5} fill="#475569" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">
                                q{i}
                            </text>
                            <line
                                x1="40" y1={padding + i * wireHeight}
                                x2={width - 20} y2={padding + i * wireHeight}
                                stroke="#1e1e2e" strokeWidth="2"
                            />
                            {/* Measurement symbol */}
                            <rect
                                x={width - 50} y={padding + i * wireHeight - 10}
                                width="20" height="20" rx="2" fill="#0a0a0f" stroke="#475569"
                            />
                            <path d={`M ${width - 45} ${padding + i * wireHeight + 5} Q ${width - 40} ${padding + i * wireHeight - 5} ${width - 35} ${padding + i * wireHeight + 5}`} fill="none" stroke="#475569" strokeWidth="1.5" />
                        </g>
                    ))}

                    {/* Gates */}
                    {circuit.map((gate, idx) => {
                        const x = padding + 60 + idx * stepWidth;
                        const y = padding + (gate.qubit || 0) * wireHeight;

                        if (gate.type === 'CNOT') {
                            const targetY = padding + gate.target * wireHeight;
                            return (
                                <g key={`gate-${idx}`}>
                                    <line x1={x} y1={y} x2={x} y2={targetY} stroke="#2dd4bf" strokeWidth="2" strokeDasharray="4 2" />
                                    <circle cx={x} cy={y} r="5" fill="#2dd4bf" />
                                    <circle cx={x} cy={targetY} r="12" fill="#0f0f1a" stroke="#2dd4bf" strokeWidth="2" />
                                    <line x1={x - 7} y1={targetY} x2={x + 7} y2={targetY} stroke="#2dd4bf" strokeWidth="2" />
                                    <line x1={x} y1={targetY - 7} x2={x} y2={targetY + 7} stroke="#2dd4bf" strokeWidth="2" />
                                </g>
                            );
                        }

                        return (
                            <g key={`gate-${idx}`} className="cursor-help group">
                                <rect
                                    x={x - 15} y={y - 15} width="30" height="30" rx="4"
                                    fill={GATE_COLORS[gate.type] || '#6366f1'}
                                />
                                <text
                                    x={x} y={y + 5} textAnchor="middle" fill="#fff"
                                    fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono"
                                >
                                    {gate.type}
                                </text>
                                {/* Tooltip placeholder */}
                                <title>{`${gate.type} Matrix: ${GATE_MATRICES[gate.type]}`}</title>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-8 border-t border-[#1e1e2e] pt-6">
                <button
                    onClick={() => setShowUnitary(!showUnitary)}
                    className="flex items-center gap-2 text-xs font-bold text-[#6366f1] uppercase tracking-widest hover:text-[#2dd4bf] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="3" y2="21" /><line x1="15" x2="15" y1="3" y2="21" /></svg>
                    {showUnitary ? 'Hide Unitary Matrix' : 'Show Full Unitary Matrix'}
                </button>

                {showUnitary && (
                    <div className="mt-4 p-6 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] font-mono text-xs text-[#94a3b8] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-[#6366f1] mb-2 block">// Computed Unitary U = Gₙ ... G₁ G₀</span>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            {[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0].map((val, i) => (
                                <div key={i} className="p-2 border border-[#1e1e2e] rounded bg-[#0f0f1a] text-[#f8fafc]">
                                    {val.toFixed(1)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuantumCircuit;
