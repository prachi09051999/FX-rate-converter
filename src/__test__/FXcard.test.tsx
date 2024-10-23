import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FXCard, { FXCardProps } from '../components/FXcard';

describe('FXCard Component', () => {
  const mockProps: FXCardProps = {
    id: 'USD_EUR',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    fxRate: 0.85
  };

  test('renders currency conversion card with correct details', () => {
    render(<FXCard {...mockProps} />);

    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // Default input value
    expect(screen.getByDisplayValue('0.85')).toBeInTheDocument(); // Converted value based on fxRate
  });

  test('calculates and displays converted value when convert button is clicked', () => {
    render(<FXCard {...mockProps} />);

    const input = screen.getByDisplayValue('1');
    fireEvent.change(input, { target: { value: '10' } }); // Change input value to 10

    fireEvent.click(screen.getByText('Convert')); // Click convert button
    
    expect(screen.getByDisplayValue('8.50')).toBeInTheDocument(); // Converted value: 10 * 0.85
  });

  test('reverses currency display when the toCurrency text is clicked', () => {
    render(<FXCard {...mockProps} />);

    fireEvent.click(screen.getByText('EUR')); // Click toCurrency (EUR)

    expect(screen.getByText('USD')).toBeInTheDocument(); // USD should still be there
    // Mocking a simple UI change for reversal, assuming the fxRate updates internally
    const newFxRate = (1 / mockProps.fxRate).toFixed(2); 
    expect(screen.getByDisplayValue(newFxRate)).toBeInTheDocument(); // 1 / 0.85 = 1.18 approx.
  });

  test('deletes the card when the delete icon is clicked', () => {
    render(<FXCard {...mockProps} />);

    fireEvent.click(screen.getByRole('img', { name: /close/i })); // Close icon click
    expect(screen.queryByText('USD')).not.toBeInTheDocument(); // USD should not exist after deletion
  });
});
