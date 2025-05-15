import React, { useEffect, useState } from "react";
import { ExternalLink, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";
import { cn } from "@/lib/utils";

const DocsButton: React.FC = () => {
  const [docs, setDocs] = useState<string[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/list-docs`)
      .then((res) => res.json())
      .then((data) => setDocs(data.documents))
      .catch((err) => console.error("Failed to fetch docs", err));
  }, []);

  const handleOpenDoc = (filename: string) => {
    const url = `${window.location.origin}/attached_assets/${filename}`;
    window.open(url, "_blank");
    setShowList(false);
  };

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <Button
        variant="outline"
        className={cn(
          "gap-2 w-full sm:w-auto justify-between sm:justify-start",
          "transition-all duration-200 hover:bg-primary/10",
          showList && "bg-primary/10"
        )}
        onClick={() => setShowList((prev) => !prev)}
      >
        <span className="text-sm sm:text-base truncate">API Documentation</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            showList && "rotate-180"
          )}
        />
      </Button>

      {showList && (
        <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-[320px] max-w-[95vw] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 py-1.5">
              Available Documents
            </h3>
            <ul className="mt-1 max-h-[300px] overflow-y-auto">
              {docs.length === 0 ? (
                <li className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  No documents available
                </li>
              ) : (
                docs.map((doc) => (
                  <li
                    key={doc}
                    className="px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors duration-150"
                    onClick={() => handleOpenDoc(doc)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="flex-1 text-sm truncate">{doc}</span>
                      <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsButton;
