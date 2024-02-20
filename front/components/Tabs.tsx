export enum TabOption {
  TOKENS_LIST,
  BALANCE,
}

interface TabsProps {
  onTabChanged: (tab: TabOption) => void;
  selectedTab: TabOption;
}

const Tabs = ({ onTabChanged, selectedTab }: TabsProps) => {
  return (
    <div className="flex items-center">
      <div
        className={`cursor-pointer border-b-4 ${
          selectedTab == TabOption.TOKENS_LIST
            ? "border-black"
            : "border-transparent"
        } p-2 lg:p-4`}
        onClick={() => onTabChanged(TabOption.TOKENS_LIST)}
      >
        <p>Todos los tokens</p>
      </div>

      <div
        className={`ml-6 lg:ml-8 cursor-pointer border-b-4 ${
          selectedTab == TabOption.BALANCE
            ? "border-black"
            : "border-transparent"
        } p-2 lg:p-4`}
        onClick={() => onTabChanged(TabOption.BALANCE)}
      >
        <p>Tu balance</p>
      </div>
    </div>
  );
};

export default Tabs;
