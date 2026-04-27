import json
from pathlib import Path
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json, to_html

def main():
    out_dir = Path('graphify-out')
    
    # 1. Merge AST and Semantic
    ast_path = out_dir / '.graphify_ast.json'
    sem_path = out_dir / '.graphify_chunk_0.json'
    
    if not ast_path.exists() or not sem_path.exists():
        print(f"Error: Missing input files. AST: {ast_path.exists()}, SEM: {sem_path.exists()}")
        return

    def read_json_robust(path):
        try:
            return json.loads(path.read_text(encoding='utf-8'))
        except UnicodeDecodeError:
            return json.loads(path.read_text(encoding='utf-16'))

    ast = read_json_robust(ast_path)
    sem = read_json_robust(sem_path)
    
    seen = {n['id'] for n in ast['nodes']}
    merged_nodes = list(ast['nodes'])
    for n in sem['nodes']:
        if n['id'] not in seen:
            merged_nodes.append(n)
            
    merged_edges = ast['edges'] + sem['edges']
    
    extract_data = {
        'nodes': merged_nodes,
        'edges': merged_edges,
        'hyperedges': sem.get('hyperedges', []),
        'input_tokens': sem.get('input_tokens', 0),
        'output_tokens': sem.get('output_tokens', 0)
    }
    
    extract_path = out_dir / '.graphify_extract.json'
    extract_path.write_text(json.dumps(extract_data, indent=2), encoding='utf-8')
    print(f"Merged into {extract_path}")

    # 2. Build Graph and Analyze
    detect_path = out_dir / '.graphify_detect.json'
    detect = read_json_robust(detect_path)
    
    G = build_from_json(extract_data)
    communities = cluster(G)
    cohesion = score_all(G, communities)
    
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    
    # Initial labels
    labels = {cid: f"Community {cid}" for cid in communities}
    questions = suggest_questions(G, communities, labels)
    
    tokens = {
        'input': extract_data.get('input_tokens', 0),
        'output': extract_data.get('output_tokens', 0)
    }
    
    report = generate(G, communities, cohesion, labels, gods, surprises, detect, tokens, '.', suggested_questions=questions)
    (out_dir / 'GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    
    to_json(G, communities, str(out_dir / 'graph.json'))
    
    analysis = {
        'communities': {str(k): v for k, v in communities.items()},
        'cohesion': {str(k): v for k, v in cohesion.items()},
        'gods': gods,
        'surprises': surprises,
        'questions': questions
    }
    (out_dir / '.graphify_analysis.json').write_text(json.dumps(analysis, indent=2), encoding='utf-8')

    # 3. Generate HTML
    to_html(G, communities, str(out_dir / 'graph.html'), community_labels=labels)
    # Use ascii-safe printing for the final confirmation
    print("Graph built, report and HTML visualization generated successfully.")

if __name__ == "__main__":
    main()
