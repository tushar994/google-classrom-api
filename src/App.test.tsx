import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import App from './App';

test('Test Loading', async () => {
  
  render(<App />);

  expect(screen.getByText('loading')).toBeInTheDocument();
  expect(await screen.getByRole('button')).toBeInTheDocument();
  // // await waitForElementToBeRemoved(await screen.getByText('loading'), { timeout: 10000 })
  // screen.debug();
  // await waitFor(() => {
  //   expect(screen.getByText('sign in')).toBeInTheDocument()
  // }, { timeout: 10000 })
  // const buttonEl = await screen.getByText('sign in');
    
  // userEvent.click(buttonEl);
}, 30000);
