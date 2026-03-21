# React Mock-to-Code Agents

This reference documents the four specialized agents that work together to transform mockups into React code.

## 1. Vision Agent
Analyzes mockup screenshots using Claude's vision capabilities.

- **Responsibility**: Structural and visual analysis.
- **Input**: PNG/JPG image.
- **Output**: Structured description of layout, colors, components, and spacing.
- **Prompting Focus**: 
    - Identify UI components (Button, Card, Input, etc.)
    - Map positions (x, y, w, h in percentages)
    - Extract hex colors and font families.
    - Identify content (text, icons).

## 2. Code Agent
Generates React code based on the Vision Agent's analysis.

- **Responsibility**: Code generation.
- **Input**: Visual analysis report + (optional) previous code iteration.
- **Output**: React component code (JSX/TSX), CSS (prefer Vanilla CSS), and logic.
- **Standards**:
    - Use React 18+ and Vite conventions.
    - Prefer Vanilla CSS or as requested.
    - Ensure accessibility (ARIA labels).

## 3. Compare Agent
Performs a "pixel-perfect" and semantic comparison between the original mock and the generated code's output.

- **Responsibility**: Quality control and difference detection.
- **Input**: Original mock image + screenshot of the rendered component.
- **Output**: Similarity score (%) + list of critical differences (broken layout, color mismatch, spacing off).
- **Technique**: Uses AI-powered visual diffing + structural comparison.

## 4. Fixer Agent
Refines the generated code based on the Compare Agent's feedback.

- **Responsibility**: Iterative improvement.
- **Input**: Previous code + comparison report.
- **Output**: Improved React code.
- **Priority Matrix**:
    - CRITICAL: Broken layout (fix time: 5 units)
    - HIGH: Color mismatch (fix time: 2 units)
    - MEDIUM: Spacing off (fix time: 1 unit)
    - LOW: Shadows/Fine details (fix time: 0.5 units)
