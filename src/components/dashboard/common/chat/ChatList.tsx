import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";

const ChatList = () => {
  return (
    <Card className="h-full min-h-0 flex flex-col overflow-hidden">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Badge variant="secondary">2 new</Badge>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3">
            <div className="p-3 rounded-xl cursor-pointer transition-all bg-primary/10 border border-primary/20 hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-linear-to-br text-white"></AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground truncate">
                      Kavishka Sulochana
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      9:45 AM
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0"
                    ></Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      Elpitiya
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    Test test
                  </p>
                </div>
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                  2
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatList;
