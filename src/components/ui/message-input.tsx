"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Info, Loader2, Paperclip, Square, X } from "lucide-react"
import { omit } from "remeda"

import { cn } from "@/lib/utils"
import { useAutosizeTextArea } from "@/hooks/use-autosize-textarea"
import { Button } from "@/components/ui/button"
import { FilePreview } from "@/components/ui/file-preview"

interface MessageInputBaseProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  submitOnEnter?: boolean
  stop?: () => void
  isGenerating: boolean
  enableInterrupt?: boolean
}

interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
  allowAttachments?: false
}

interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
  allowAttachments: true
  files: File[] | null
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
}

type MessageInputProps =
  | MessageInputWithoutAttachmentProps
  | MessageInputWithAttachmentsProps

export function MessageInput({
  value,
  submitOnEnter = true,
  stop,
  isGenerating,
  enableInterrupt = false,
  className,
  ...props
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMultiline, setIsMultiline] = useState(false)

  // Auto-resize textarea
  useAutosizeTextArea({
    ref: textareaRef,
    dependencies: [value]
  })

  // Handle file input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0 && "setFiles" in props) {
      props.setFiles(files)
    }
  }

  // Handle file removal
  const handleFileRemove = (index: number) => {
    if ("setFiles" in props && props.files) {
      const newFiles = props.files.filter((_, i) => i !== index)
      props.setFiles(newFiles.length > 0 ? newFiles : null)
    }
  }

  // Handle key presses
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && submitOnEnter) {
      event.preventDefault()
      if (textareaRef.current?.form) {
        textareaRef.current.form.requestSubmit()
      }
    }

    // Track multiline state
    if (event.key === "Enter" && event.shiftKey) {
      setIsMultiline(true)
    }
  }

  // Update multiline state based on content
  useEffect(() => {
    setIsMultiline(value.includes("\n"))
  }, [value])

  const showAttachments = "files" in props && props.files && props.files.length > 0
  const showAttachButton = "allowAttachments" in props && props.allowAttachments

  return (
    <div className="relative">
      {/* File attachments preview */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="flex flex-wrap gap-2">
              {props.files?.map((file, index) => (
                <FilePreview
                  key={index}
                  file={file}
                  onRemove={() => handleFileRemove(index)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className="relative flex items-end gap-2 p-2 border rounded-lg bg-background">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none",
            "min-h-[40px] max-h-[200px] py-2 px-3",
            className
          )}
          placeholder="Type your message..."
          rows={1}
          {...omit(props, ["allowAttachments", "files", "setFiles", "stop", "isGenerating", "enableInterrupt"])}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Attachment button */}
          {showAttachButton && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,text/*,application/pdf"
              />
            </>
          )}

          {/* Submit/Stop button */}
          <Button
            type="submit"
            size="sm"
            disabled={!value.trim() && !showAttachments}
            className="h-8 w-8 p-0"
          >
            {isGenerating ? (
              <Square className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Hint text */}
      {!isMultiline && (
        <p className="text-xs text-muted-foreground mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      )}
    </div>
  )
}