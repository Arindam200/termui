import React, { useState, useCallback, createContext, useContext } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from 'termui';
import type { ReactNode } from 'react';

interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  isDirty: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string) => void;
}

const FormContext = createContext<FormContextValue>({
  values: {},
  errors: {},
  isDirty: false,
  setFieldValue: () => {},
  setFieldError: () => {},
});

export function useFormContext() {
  return useContext(FormContext);
}

export interface FormField {
  name: string;
  validate?: (value: unknown) => string | null;
}

export interface FormProps {
  onSubmit: (values: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  fields?: FormField[];
  children: ReactNode;
}

export function Form({ onSubmit, initialValues = {}, fields = [], children }: FormProps) {
  const theme = useTheme();
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((e) => ({ ...e, [name]: error }));
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input === 's') {
      // Validate all fields
      const newErrors: Record<string, string> = {};
      for (const field of fields) {
        const err = field.validate ? field.validate(values[field.name]) : null;
        if (err) newErrors[field.name] = err;
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      onSubmit(values);
    }
  });

  return (
    <FormContext.Provider value={{ values, errors, isDirty, setFieldValue, setFieldError }}>
      <Box flexDirection="column" gap={1}>
        {children}
        <Text color={theme.colors.mutedForeground} dimColor>
          Press Ctrl+S to submit
        </Text>
      </Box>
    </FormContext.Provider>
  );
}
