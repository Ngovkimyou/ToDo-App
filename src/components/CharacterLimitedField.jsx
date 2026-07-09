function CharacterLimitedField({
  label,
  value,
  limit,
  status,
  placeholder,
  multiline = false,
  onChange,
}) {
  const FieldTag = multiline ? "textarea" : "input";

  return (
    <label className="form-field">
      <span>{label}</span>
      <div className={`limited-field ${multiline ? "limited-field-multiline" : ""} ${status}`}>
        <FieldTag
          type={multiline ? undefined : "text"}
          placeholder={placeholder}
          value={value}
          maxLength={limit}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="char-counter">
          {value.length}/{limit}
        </span>
      </div>
    </label>
  );
}

export default CharacterLimitedField;
