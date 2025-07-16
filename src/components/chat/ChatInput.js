import { useState } from "react";
import { Textarea, Button } from "@heroui/react";
import { motion } from "framer-motion";

export default function ChatInput({ onSendMessage, isLoading, disabled }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 bg-content1 border-t border-divider"
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about credit cards, rewards, or specific recommendations..."
        minRows={1}
        maxRows={4}
        disabled={disabled}
        className="flex-1"
        variant="bordered"
      />
      
      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        disabled={!message.trim() || disabled}
        className="self-end"
      >
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </motion.form>
  );
}