import React from 'react';
import Select, { OptionTypeBase } from 'react-select';

const colourStyles = {
  control: (styles: any) => ({
    ...styles,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
    '&:hover': { borderColor: '#6534ff' },
  }),
  input: (styles: any) => ({ ...styles, height: 36 }),
};

type FormFilterReactSelectProps = {
  options: any;
  placeholder: string;
  label: string;
  name: string;
  disabled: boolean;
  onInputChange: (value: string) => void;
  onChange: (option: OptionTypeBase) => void;
};

const FormFilterReactSelect: React.FC<FormFilterReactSelectProps> = ({
  options,
  name,
  placeholder,
  disabled,
  onInputChange,
  onChange,
  label,
}) => (
  <div>
    <label>{label}</label>
    <Select
      isDisabled={disabled}
      options={options}
      onChange={onChange}
      onInputChange={onInputChange}
      placeholder={placeholder}
      className="rselect"
      name={name}
      styles={colourStyles}
    />
  </div>
);

export default FormFilterReactSelect;
