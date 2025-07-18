import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { User, Bot, Trash2 } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string | number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  onDelete?: (id: string | number) => void;
}

export default function ChatMessage({ message, onDelete }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar className="flex-shrink-0">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <Card className={`${isUser ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
          <CardContent className="px-4 py-3">
            {message.content && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed mb-4">
                {message.content}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="text-xs opacity-60">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(message.id)}
                  className="text-xs h-6 w-6 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}