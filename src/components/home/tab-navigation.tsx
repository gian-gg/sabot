'use client';

interface TabNavigationProps {
  activeTab: 'transactions' | 'agreements';
  onTabChange: (tab: 'transactions' | 'agreements') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'transactions' as const, label: 'Transactions' },
    { id: 'agreements' as const, label: 'Agreements' },
  ];

  return (
    <div className="border-border border-b">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative cursor-pointer pb-4 text-sm font-medium transition-colors ${
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
