import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StadiumGateMapPreview from '../components/auth/StadiumGateMapPreview';

function TestWrapper() {
  const [selectedSector, setSelectedSector] = useState('north_stand');
  return <StadiumGateMapPreview selectedSector={selectedSector} onSelectSector={setSelectedSector} />;
}

describe('StadiumGateMapPreview Component', () => {
  it('renders default North Stand sector details', () => {
    render(<TestWrapper />);

    expect(screen.getByText('North Stand (Curva Ultra)')).toBeInTheDocument();
    expect(screen.getByText('Gate A - Fast Track')).toBeInTheDocument();
    expect(screen.getByText('96% Full')).toBeInTheDocument();
    expect(screen.getByText('3 mins wait')).toBeInTheDocument();
  });

  it('updates sector details when clicking sector quick selector pills', () => {
    render(<TestWrapper />);

    // Click VIP Skybox sector pill
    const vipPill = screen.getByRole('button', { name: 'VIP Skybox & Director Suite' });
    fireEvent.click(vipPill);

    expect(screen.getByText('VIP Skybox & Director Suite')).toBeInTheDocument();
    expect(screen.getByText('Gate V - Executive Entry')).toBeInTheDocument();
    expect(screen.getByText('42% Reserved')).toBeInTheDocument();
    expect(screen.getByText('0 mins wait')).toBeInTheDocument();

    // Click South Stand sector pill
    const southPill = screen.getByRole('button', { name: 'South Family Tribune' });
    fireEvent.click(southPill);

    expect(screen.getByText('South Family Tribune')).toBeInTheDocument();
    expect(screen.getByText('Gate C - Access Gate')).toBeInTheDocument();
    expect(screen.getByText('88% Full')).toBeInTheDocument();
    expect(screen.getByText('5 mins wait')).toBeInTheDocument();
  });

  it('calls onSelectSector callback when SVG sector badge/path is clicked', () => {
    const handleSelectSector = vi.fn();
    render(<StadiumGateMapPreview selectedSector="north_stand" onSelectSector={handleSelectSector} />);

    // Click West badge on SVG map
    const westBadge = screen.getByText('WEST');
    fireEvent.click(westBadge);

    expect(handleSelectSector).toHaveBeenCalledWith('west_press');
  });
});
