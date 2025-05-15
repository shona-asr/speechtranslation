import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import PageContainer from "@/components/layout/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Languages,
  Volume2,
  RotateCcw,
  MoreVertical,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import { useHistory } from "@/hooks/useHistory";
import { HistoryItem } from "@/lib/types";
import AudioPlayer from "@/components/AudioPlayer";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const History = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [location, setLocation] = useLocation();
  const { historyItems, deleteHistoryItem, addHistoryItem } = useHistory();
  const { toast } = useToast();

  // Parse the id from the URL
  const params = new URLSearchParams(location.split("?")[1]);
  const selectedId = params.get("id");

  useEffect(() => {
    let filtered = [...historyItems];

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => {
        switch (activeTab) {
          case "transcriptions":
            return item.type === "transcription";
          case "transcriptions_stream":
            return item.type === "transcription_stream";
          case "translations":
            return item.type === "translation";
          case "text-to-speech":
            return item.type === "textToSpeech";
          case "speech-to-speech":
            return item.type === "speechToSpeech";
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((item) => {
        // Search in different fields based on item type
        switch (item.type) {
          case "transcription":
            return item.transcription.toLowerCase().includes(searchQuery.toLowerCase());
          case "transcription_stream":
            return item.transcription.toLowerCase().includes(searchQuery.toLowerCase());
          case "translation":
            return (
              item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
            );
          case "textToSpeech":
            return item.text.toLowerCase().includes(searchQuery.toLowerCase());
          case "speechToSpeech":
            return (
              item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.translatedText.toLowerCase().includes(searchQuery.toLowerCase())
            );
          default:
            return false;
        }
      });
    }

    // Filter by language
    if (language !== "all") {
      filtered = filtered.filter((item) => {
        switch (item.type) {
          case "transcription":
            return item.language === language;
          case "transcription_stream":
            return item.language === language;
          case "translation":
            return item.sourceLanguage === language || item.targetLanguage === language;
          case "textToSpeech":
            return item.language === language;
          case "speechToSpeech":
            return item.originalLanguage === language || item.translatedLanguage === language;
          default:
            return false;
        }
      });
    }

    // Sort
    if (sortOrder === "recent") {
      filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      filtered.sort((a, b) => a.timestamp - b.timestamp);
    }

    setFilteredItems(filtered);

    // If there's a selected ID, scroll to it
    if (selectedId) {
      setTimeout(() => {
        const element = document.getElementById(`history-item-${selectedId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          element.classList.add("ring-2", "ring-primary", "ring-offset-2");
        }
      }, 100);
    }
  }, [historyItems, activeTab, searchQuery, language, sortOrder, selectedId]);

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      toast({
        title: "Success",
        description: "History item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete history item",
        variant: "destructive",
      });
    }
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  // Handle new real-time transcriptions
  const { user } = useAuth();
  const handleNewTranscription = async (transcription: string, language: string, audioBlob: Blob) => {
    if (!user) return;

    // Generate a unique ID for the new history item
    const id = `transcript-${Date.now()}`;

    // Create a new transcription history item from real-time data
    const newHistoryItem: HistoryItem = {
      id,
      type: 'transcription',
      timestamp: Date.now(),
      userId: user.uid,
      language,
      transcription,
      audioBlob,
    };

    // Add to history
    try {
      await addHistoryItem(newHistoryItem);

      toast({
        title: "Transcription Saved",
        description: "Your real-time transcription has been saved to history"
      });
    } catch (error) {
      console.error('Failed to save transcription to history:', error);
      toast({
        title: "Error",
        description: "Failed to save transcription to history",
        variant: "destructive"
      });
    }
  };

  return (
    <PageContainer
      title="History"
      description="Browse your past translations and transcriptions"
    >


      {/* Tab Navigation */}
      <div className="border-b border-border mb-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            <TabsList className="flex w-max whitespace-nowrap gap-2 px-4 scroll-smooth">
              <TabsTrigger value="all" className="flex-shrink-0">All</TabsTrigger>
              <TabsTrigger value="transcriptions" className="flex-shrink-0">Transcriptions</TabsTrigger>
              <TabsTrigger value="transcriptions_stream" className="flex-shrink-0">Real Time Transcriptions</TabsTrigger>
              <TabsTrigger value="translations" className="flex-shrink-0">Translations</TabsTrigger>
              <TabsTrigger value="text-to-speech" className="flex-shrink-0">Text to Speech</TabsTrigger>
              <TabsTrigger value="speech-to-speech" className="flex-shrink-0">Speech to Speech</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>


      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="shona">Shona</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="ndebele">Ndebele</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Most Recent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Items */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Card 
                  key={item.id}
                  id={`history-item-${item.id}`}
                  className="transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          {item.type === "transcription" && (
                            <Mic className="text-primary h-5 w-5" />
                          )}
                          {item.type === "transcription_stream" && (
                            <Mic className="text-primary h-5 w-5" />
                          )}
                          {item.type === "translation" && (
                            <Languages className="text-primary h-5 w-5" />
                          )}
                          {item.type === "textToSpeech" && (
                            <Volume2 className="text-primary h-5 w-5" />
                          )}
                          {item.type === "speechToSpeech" && (
                            <RotateCcw className="text-primary h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium capitalize">{item.type}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.type === "transcription" && `${item.language} • `}
                            {item.type === "transcription_stream" && `${item.language} • `}
                            {item.type === "translation" && `${item.sourceLanguage} → ${item.targetLanguage} • `}
                            {item.type === "textToSpeech" && `${item.language} • `}
                            {item.type === "speechToSpeech" && `${item.originalLanguage} → ${item.translatedLanguage} • `}
                            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              let content = "";
                              switch (item.type) {
                                case "transcription":
                                  content = item.transcription;
                                  break;
                                  case "transcription_stream":
                                    content = item.transcription;
                                    break;
                                case "translation":
                                  content = `${item.originalText}\n\n${item.translatedText}`;
                                  break;
                                case "textToSpeech":
                                  content = item.text;
                                  break;
                                case "speechToSpeech":
                                  content = `${item.originalText}\n\n${item.translatedText}`;
                                  break;
                              }
                              handleCopyContent(content);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="border-t border-border pt-4">
                      {item.type === "transcription" && (
                        <>
                          <p className="text-sm mb-4">{item.transcription}</p>
                          {item.audioBlob && (
                            <AudioPlayer audioBlob={item.audioBlob} />
                          )}
                        </>
                      )}

                      {item.type === "transcription_stream" && (
                        <>
                          <p className="text-sm mb-4">{item.transcription}</p>
                          {item.audioBlob && (
                            <AudioPlayer audioBlob={item.audioBlob} />
                          )}
                        </>
                      )}

                      {item.type === "translation" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Original ({item.sourceLanguage})
                            </p>
                            <p className="text-sm">{item.originalText}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Translation ({item.targetLanguage})
                            </p>
                            <p className="text-sm">{item.translatedText}</p>
                          </div>
                          {item.audioBlob && (
                            <div className="md:col-span-2 mt-2">
                              <AudioPlayer audioBlob={item.audioBlob} label="Translated Audio" />
                            </div>
                          )}
                        </div>
                      )}

                      {item.type === "textToSpeech" && (
                        <>
                          <p className="text-sm mb-4">{item.text}</p>
                          <AudioPlayer audioBlob={item.audioBlob} />
                        </>
                      )}

                      {item.type === "speechToSpeech" && (
                        <div>
                          {/* Original speech section */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium">
                                Original Speech ({item.originalLanguage})
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border rounded-md p-3 bg-muted/20">
                                <p className="text-sm">{item.originalText}</p>
                              </div>
                              <div>
                                <AudioPlayer 
                                  audioBlob={item.originalAudioBlob} 
                                  label="Original Audio"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Translated speech section */}
                          <div className="pt-3 border-t">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium">
                                Translated Speech ({item.translatedLanguage})
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border rounded-md p-3 bg-muted/20">
                                <p className="text-sm">{item.translatedText}</p>
                              </div>
                              <div>
                                <AudioPlayer 
                                  audioBlob={item.translatedAudioBlob} 
                                  label="Translated Audio"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">No history items found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    {searchQuery || language !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "Your history will appear here as you use the app's features."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default History;