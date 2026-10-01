import re

file_path = 'client/pages/admin/AdminResults.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace('getAdminTestResults\n} from "../../services/adminApi.js";', 'getAdminTestResults,\n  getTestSections\n} from "../../services/adminApi.js";')

# 2. Update columns base
base_columns = """const baseColumns = [
  ["name", "Name"],
  ["college_email", "Email"],
  ["mobile_number", "Mobile"],
  ["prn", "PRN"],
  ["campus", "Campus"],
  ["branch", "Branch"],
  ["division", "Division"],
  ["living_at", "Living at"],
  ["total_score", "Score"],
  ["total_questions", "Total"],
  ["attempted_questions", "Attempted"]
];"""
content = re.sub(r'const columns = \[.*?\];', base_columns, content, flags=re.DOTALL)

# 3. Add sections state and logic
state_block = """  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [results, setResults] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState(baseColumns);"""
content = content.replace('  const [test, setTest] = useState(null);\n  const [results, setResults] = useState([]);', state_block)

fetch_logic = """        const [testResponse, resultsResponse, sectionsResponse] = await Promise.all([
          getAdminTest(testId),
          getAdminTestResults(testId),
          getTestSections(testId)
        ]);
        setTest(testResponse?.data || null);
        setResults(Array.isArray(resultsResponse?.data) ? resultsResponse.data : []);
        
        const fetchedSections = Array.isArray(sectionsResponse?.data) ? sectionsResponse.data : [];
        setSections(fetchedSections);
        
        // Build dynamic columns based on sections
        const dynamicCols = [...baseColumns];
        fetchedSections.forEach(sec => {
          if (sec.section_number === 1) dynamicCols.push(["section1_score", sec.name]);
          else if (sec.section_number === 2) dynamicCols.push(["section2_score", sec.name]);
          else if (sec.section_number === 3) dynamicCols.push(["section3_score", sec.name]);
        });
        dynamicCols.push(["submitted_at", "Submitted at"]);
        setDynamicColumns(dynamicCols);"""
content = content.replace("""        const [testResponse, resultsResponse] = await Promise.all([
          getAdminTest(testId),
          getAdminTestResults(testId)
        ]);
        setTest(testResponse?.data || null);
        setResults(Array.isArray(resultsResponse?.data) ? resultsResponse.data : []);""", fetch_logic)

# 4. Replace `columns` with `dynamicColumns` in the render
content = content.replace('columns.map', 'dynamicColumns.map')

# 5. Update the Dialog to show dynamic sections
dialog_scores = """                <h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Test Scores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Total Score</span>
                    <span className="text-2xl font-black text-foreground">{selectedResult.total_score}</span>
                  </div>
                  {sections.map(sec => {
                    let scoreKey = null;
                    if (sec.section_number === 1) scoreKey = "section1_score";
                    else if (sec.section_number === 2) scoreKey = "section2_score";
                    else if (sec.section_number === 3) scoreKey = "section3_score";
                    if (!scoreKey) return null;
                    return (
                      <div key={sec.id} className="bg-muted rounded-xl p-4 text-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">{sec.name}</span>
                        <span className="text-2xl font-black text-foreground">{selectedResult[scoreKey]}</span>
                      </div>
                    );
                  })}
                </div>"""

# Remove the old static IQ, EQ, SQ
content = re.sub(r'<h3 className="font-bold text-lg border-b border-border pb-2 text-primary">Test Scores</h3>.*?</div>\s*</div>', dialog_scores + '\n              </div>', content, flags=re.DOTALL)


with open(file_path, 'w') as f:
    f.write(content)

print("Dynamic columns added to AdminResults")
