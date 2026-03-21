# React Mock-to-Code Workflows

This reference describes the specialized workflows for automating the transformation of mocks into React components.

## 1. Iterative Convergence Loop (Plan-Act-Validate)

The orchestrator manages a loop until a similarity threshold is met or the maximum number of iterations is reached.

### Steps:
1.  **Analyze (Vision Agent)**: Extract structural details from the mock.
2.  **Generate (Code Agent)**: Create/Update the component code.
3.  **Render (Puppeteer/Playwright)**: Capture a screenshot of the generated component.
4.  **Compare (Compare Agent)**: Evaluate similarity between the mock and screenshot.
5.  **Refine (Fixer Agent)**: Identify and apply necessary fixes if similarity is below threshold.

### Parameters:
- **Similarity Threshold**: Default is 0.98 (98% match).
- **Max Iterations**: Default is 10.

---

## 2. Continuous Watch Mode

Automates the processing of multiple pages/components in a specified directory.

### Process:
1.  Scan for new mock files in a `mocks/` folder.
2.  Initialize a new convergence loop for each detected file.
3.  Save the generated components into a `src/components/` folder.
4.  Generate a comprehensive report (JSON) for each page processed.

---

## 3. Difference Detection Heuristics

To avoid false positives from irrelevant differences, use a weighted scoring system:

- **Structure Similarity (50%)**: Layout, component presence, and nesting.
- **Color Palette Similarity (30%)**: Hex matches and dominant colors.
- **Text & Content Similarity (20%)**: Text accuracy and iconography.
- **Critical Differences**: Identifying and prioritizing issues like missing components or broken grids.
