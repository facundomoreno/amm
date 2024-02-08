import TokenCard, { TokenCardProps } from "./TokenCard";

interface TokenListProps {
  tokenItems: TokenCardProps[];
}

const TokenList = ({ tokenItems }: TokenListProps) => {
  return (
    <div>
      {tokenItems.map((item, key) => (
        <TokenCard
          token={item.token}
          historicPrices={item.historicPrices}
          color={item.color}
          key={key}
        />
      ))}
    </div>
  );
};

export default TokenList;
