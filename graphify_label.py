import json
from pathlib import Path
from graphify.report import update_labels
from graphify.export import to_html

def main():
    out_dir = Path('graphify-out')
    analysis_path = out_dir / '.graphify_analysis.json'
    extract_path = out_dir / '.graphify_extract.json'
    report_path = out_dir / 'GRAPH_REPORT.md'
    
    if not analysis_path.exists():
        print("Analysis file not found.")
        return

    analysis = json.loads(analysis_path.read_text(encoding='utf-8'))
    
    # Define descriptive names for communities
    labels_dict = {
        "0": "Quantum AI Foundations & NISQ",
        "1": "Optimization & QAOA Portfolio",
        "2": "QNN Convergence & Barren Plateaus",
        "3": "Quantum Machine Learning Kernels",
        "4": "Subscriber Growth Systems",
        "5": "Interactive Visualization (Bloch Sphere)",
        "6": "Interactive Circuit Simulation",
        "7": "Editorial Navigation & Meta",
        "8": "Astro Framework Orchestration",
        "9": "Visual Design Tokens (Tailwind)",
        "10": "Serverless Infrastructure",
        "11": "TypeScript Environment Definitions",
        "12": "Content Schema Architecture",
        "13": "Newsletter Subscription Funnel"
    }
    
    # Update the report
    report = report_path.read_text(encoding='utf-8')
    for cid, name in labels_dict.items():
        report = report.replace(f"Community {cid}", name)
    report_path.write_text(report, encoding='utf-8')
    
    # Re-generate HTML with labels
    from graphify.build import build_from_json
    extraction = json.loads(extract_path.read_text(encoding='utf-8'))
    G = build_from_json(extraction)
    communities = {int(k): v for k, v in analysis['communities'].items()}
    to_html(G, communities, str(out_dir / 'graph.html'), community_labels={int(k): v for k, v in labels_dict.items()})
    
    print("Labels applied and outputs updated.")

if __name__ == "__main__":
    main()
