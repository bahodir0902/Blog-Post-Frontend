import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import Dropdown from "../ui/Dropdown";
import { useMemo } from "react";

type Props = {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
};

export default function PaginationControls({
                                               currentPage,
                                               totalCount,
                                               pageSize,
                                               hasNext,
                                               hasPrevious,
                                               onPageChange,
                                           }: Props) {
    const totalPages = Math.ceil(totalCount / pageSize);

    const pageOptions = useMemo(() => {
        const options = [];
        for (let i = 1; i <= totalPages; i++) {
            options.push({ label: `Page ${i}`, value: String(i) });
        }
        return options;
    }, [totalPages]);

    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="text-sm text-[var(--color-text-tertiary)]">
                Showing <span className="font-medium text-[var(--color-text-secondary)]">{startItem}–{endItem}</span> of{" "}
                <span className="font-medium text-[var(--color-text-secondary)]">{totalCount}</span> results
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={!hasPrevious}
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className="!px-3"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                {totalPages > 1 && (
                    <Dropdown
                        options={pageOptions}
                        value={String(currentPage)}
                        onChange={(v) => onPageChange(Number(v))}
                        className="w-32"
                    />
                )}

                <Button
                    variant="secondary"
                    size="sm"
                    disabled={!hasNext}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="!px-3"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}