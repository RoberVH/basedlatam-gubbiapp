/* Utility function to process events handlers on each form in the App
*/

import { useState } from 'react';

const useHooksForm = (callback) => {

  const [values, setValues] = useState({});

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
      callback();
  };

  const handleChange = (event) => {
    event.persist();
    setValues(values => ({ ...values, [event.target.id]: event.target.value }));
  };
/*
  const resetForm = () => {
      for (let prop in values)
          setValues(values[prop]=null)
    
  }*/
  return {
    handleChange,
    handleSubmit,
    values,
  }
};

export default useHooksForm;