interface SourceMapEntry {
  modulePath: string;
  symbols: string[];
  whyItMatters: string;
  readHint: string;
}

export function SourceMapTable({ entries }: { entries: SourceMapEntry[] }) {
  return (
    <table className="rf-table">
      <thead>
        <tr>
          <th>Module</th>
          <th>Symbols</th>
          <th>Why It Matters</th>
          <th>Read Hint</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.modulePath}>
            <td>
              <code>{entry.modulePath}</code>
            </td>
            <td>{entry.symbols.join(", ")}</td>
            <td>{entry.whyItMatters}</td>
            <td>{entry.readHint}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
