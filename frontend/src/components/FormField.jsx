import { FIELD_DEFINITIONS } from '../lib/formFieldCatalog';

function FormField({ fieldName, value, error, onChange, highlight }) {
  const field = FIELD_DEFINITIONS[fieldName];

  if (!field) {
    return null;
  }

  const wrapperClass = `field${highlight ? ' field-highlight' : ''}`;

  if (field.inputType === 'textarea') {
    return (
      <label className={wrapperClass}>
        <span>{field.label}</span>
        <textarea
          placeholder={field.placeholder}
          rows={5}
          value={value}
          onChange={(event) => onChange(fieldName, event.target.value)}
        />
        {error ? <small>{error}</small> : null}
      </label>
    );
  }

  if (field.inputType === 'select') {
    return (
      <label className={wrapperClass}>
        <span>{field.label}</span>
        <select
          value={value}
          onChange={(event) => onChange(fieldName, event.target.value)}
        >
          <option value="">Select an option</option>
          {field.options.map(([optionValue, label]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {label}
            </option>
          ))}
        </select>
        {error ? <small>{error}</small> : null}
      </label>
    );
  }

  if (field.inputType === 'boolean') {
    return (
      <fieldset className={wrapperClass}>
        <span>{field.label}</span>
        <div className="toggle-row">
          <label className={`toggle-chip${value === true ? ' is-selected' : ''}`}>
            <input
              checked={value === true}
              name={fieldName}
              onChange={() => onChange(fieldName, true)}
              type="radio"
            />
            Yes
          </label>
          <label className={`toggle-chip${value === false ? ' is-selected' : ''}`}>
            <input
              checked={value === false}
              name={fieldName}
              onChange={() => onChange(fieldName, false)}
              type="radio"
            />
            No
          </label>
        </div>
        {error ? <small>{error}</small> : null}
      </fieldset>
    );
  }

  if (field.inputType === 'checkboxes') {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <fieldset className={wrapperClass}>
        <span>{field.label}</span>
        <div className="checkbox-grid">
          {field.options.map(([optionValue, label]) => {
            const checked = selectedValues.includes(optionValue);

            return (
              <label
                key={optionValue}
                className={`checkbox-chip${checked ? ' is-selected' : ''}`}
              >
                <input
                  checked={checked}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange(fieldName, [...selectedValues, optionValue]);
                      return;
                    }

                    onChange(
                      fieldName,
                      selectedValues.filter((item) => item !== optionValue)
                    );
                  }}
                  type="checkbox"
                />
                {label}
              </label>
            );
          })}
        </div>
        {error ? <small>{error}</small> : null}
      </fieldset>
    );
  }

  return (
    <label className={wrapperClass}>
      <span>{field.label}</span>
      <input
        placeholder={field.placeholder}
        type={field.inputType}
        value={value}
        onChange={(event) => onChange(fieldName, event.target.value)}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

export default FormField;
