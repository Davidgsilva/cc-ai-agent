import { Button } from "@/components/ui/button"

interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="p-4">
      <h2 className="text-center text-2xl font-bold">{label}</h2>
      <div className="flex flex-col 2xl:flex-row gap-6 text-sm">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="default"
            onClick={() => append({ role: "user", content: suggestion })}
            className="cursor-pointer hover:bg-accent"
          >
            <p>{suggestion}</p>
          </Button>
        ))}
      </div>
    </div>
  )
}
