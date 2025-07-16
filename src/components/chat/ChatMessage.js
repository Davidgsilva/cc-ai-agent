import { Card, CardBody, Avatar, Button } from "@heroui/react";
import { motion } from "framer-motion";

export default function ChatMessage({ message, onDelete }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar
        size="sm"
        color={isUser ? "primary" : "secondary"}
        name={isUser ? "You" : "AI"}
        className="flex-shrink-0"
      />
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <Card className={`${isUser ? 'bg-primary text-primary-foreground' : 'bg-content2'}`}>
          <CardBody className="px-4 py-3">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-divider">
              <span className="text-xs opacity-60">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              
              {onDelete && (
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => onDelete(message.id)}
                  className="text-xs"
                >
                  Delete
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
}