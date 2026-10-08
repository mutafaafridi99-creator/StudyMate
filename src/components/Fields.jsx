export const SUBJECTS = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "General Knowledge",
  "Other",
];
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function Select({ id, label, value, onChange, options, disabled }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map((o) => (
          <option key={String(o)} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
