import SwapHistoryCard from "./SwapHistoryCard";
import { SwapHistoryDataType } from "@/hooks/useGetSwapHistory";
import ReactPaginate from "react-paginate";
import "../utils/paginationStyle.css";

interface SwapHistoryListProps {
  swapHistory: SwapHistoryDataType[];
  onPageChange: (page: any) => void;
  pageCount: number;
}

const SwapHistoryList = ({
  swapHistory,
  onPageChange,
  pageCount,
}: SwapHistoryListProps) => {
  return (
    <>
      <p className="font-bold text-sm mt-4">Historial de intercambios:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mt-4">
        {swapHistory.map((item, key) => (
          <SwapHistoryCard key={key} swapData={item} />
        ))}
      </div>
      <div className="mt-4">
        <ReactPaginate
          breakLabel="..."
          nextLabel=">"
          onPageChange={(page: any) => onPageChange(page)}
          pageRangeDisplayed={1}
          pageCount={pageCount}
          previousLabel="<"
          renderOnZeroPageCount={null}
          breakClassName={"page-item"}
          breakLinkClassName={"page-link"}
          containerClassName={"pagination"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
          activeClassName={"active"}
        />
      </div>
    </>
  );
};

export default SwapHistoryList;
