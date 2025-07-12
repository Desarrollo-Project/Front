import React, { useState } from 'react';
import { Header } from './Header';
import { AuctionList } from './AuctionList';
import { AuctionDetail } from './AuctionDetail';
import { Auction } from '../../../types/index';

const AuctionExplorer: React.FC = () => {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const handleSelectAuction = (auction: Auction) => {
    setSelectedAuction(auction);
  };

  const handleBack = () => {
    setSelectedAuction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showBackButton={!!selectedAuction}
        onBack={handleBack}
        title={selectedAuction ? selectedAuction.name : undefined}
      />
      <main className="pb-8">
        {selectedAuction ? (
          <AuctionDetail auction={selectedAuction} />
        ) : (
          <AuctionList onSelectAuction={handleSelectAuction} />
        )}
      </main>
    </div>
  );
};

export default AuctionExplorer;