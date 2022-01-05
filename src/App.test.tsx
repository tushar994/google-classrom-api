import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import App from './App';

test('Test Loading', async () => {
  
  render(<App />);

  expect(screen.getByText('loading')).toBeInTheDocument();
});


