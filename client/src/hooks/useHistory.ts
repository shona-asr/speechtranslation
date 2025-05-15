import { useState, useEffect, useCallback } from "react";
import { HistoryItem, HistoryItemType } from "@/lib/types";
import { historyDB } from "@/lib/indexedDB";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useHistory() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = useCallback(async (type?: HistoryItemType) => {
    if (!user) {
      setHistoryItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const items = await historyDB.getHistoryItems(user.uid, type);
      setHistoryItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load history items",
        variant: "destructive",
      });
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistoryItems([]);
      setIsLoading(false);
    }
  }, [user, fetchHistory]);

  const deleteHistoryItem = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await historyDB.deleteHistoryItem(id);
      setHistoryItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete history item",
        variant: "destructive",
      });
      console.error("Error deleting history item:", error);
    }
  }, [user, toast]);

  const clearHistory = useCallback(async () => {
    if (!user) return;

    try {
      await historyDB.clearHistory(user.uid);
      setHistoryItems([]);
      toast({
        title: "Success",
        description: "History cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
      console.error("Error clearing history:", error);
    }
  }, [user, toast]);

  const getHistoryItem = useCallback(async (id: string) => {
    if (!user) return null;

    try {
      return await historyDB.getHistoryItem(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retrieve history item",
        variant: "destructive",
      });
      console.error("Error getting history item:", error);
      return null;
    }
  }, [user, toast]);

  const filterHistoryByType = useCallback((type: HistoryItemType) => {
    fetchHistory(type);
  }, [fetchHistory]);
  
  const addHistoryItem = useCallback(async (item: HistoryItem) => {
    if (!user) return null;
    
    try {
      // Make sure the item has the user ID
      const historyItem = {
        ...item,
        userId: user.uid,
        timestamp: item.timestamp || Date.now()
      };
      
      // Add the item to the database
      const id = await historyDB.addHistoryItem(historyItem);
      
      // Update the local state with the new item
      setHistoryItems(prevItems => [historyItem, ...prevItems]);
      
      return id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save history item",
        variant: "destructive",
      });
      console.error("Error adding history item:", error);
      return null;
    }
  }, [user, toast]);

  return {
    historyItems,
    isLoading,
    deleteHistoryItem,
    clearHistory,
    filterHistoryByType,
    getHistoryItem,
    addHistoryItem,
    refreshHistory: fetchHistory
  };
}
