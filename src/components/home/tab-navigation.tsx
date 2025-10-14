'use client';

interface TabNavigationProps {
  activeTab: 'transactions' | 'contracts' | 'verification';
  onTabChange: (tab: 'transactions' | 'contracts' | 'verification') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'transactions' as const, label: 'Transactions' },
    { id: 'contracts' as const, label: 'Active Contracts' },
    { id: 'verification' as const, label: 'Verification' },
  ];

  return (
    <div className="border-border border-b">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="bg-primary absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
