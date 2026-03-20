/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/prefer-regexp-exec, @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import { InputRule, textblockTypeInputRule } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  isLoading,
  disabled,
}: MessageInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const SmartEditorExtension = Extension.create({
    name: "smartEditorExtension",

    addInputRules() {
      return [
        new InputRule({
          find: /(?:^|\s)(`([^`]+)`)$/,
          handler: ({ state, range, match }) => {
            const { tr } = state;
            const fullMatchStr = match[0] || "";
            const codeStr = match[1] || "";
            const textContent = match[2] || "";

            const start = range.from + fullMatchStr.indexOf(codeStr);
            const end = start + codeStr.length;

            const codeMark = (state.schema.marks as any).code;
            tr.replaceWith(start, end, state.schema.text(textContent as string))
              .addMark(start, start + textContent.length, codeMark.create());

            tr.removeStoredMark(codeMark);
            tr.insertText(" ");
          },
        }),
        textblockTypeInputRule({
          find: /^```([a-zA-Z0-9]*)\s$/,
          type: ((this as any).editor.schema.nodes as any).codeBlock,
          getAttributes: (match) => {
            return { language: match[1] };
          },
        }),
      ];
    },

    addKeyboardShortcuts() {
      return {
        Enter: ({ editor }) => {
          if (editor.isActive("codeBlock")) {
            return false;
          }
          const { state } = editor;
          const { $from } = state.selection;
          const textBefore = $from.parent.textContent;
          if (/^```([a-zA-Z0-9]*)\s*$/.test(textBefore)) {
            const language = textBefore.match(/^```([a-zA-Z0-9]*)\s*$/)?.[1] || "";
            editor
              .chain()
              .deleteRange({ from: $from.start(), to: $from.pos })
              .setCodeBlock({ language })
              .run();
            return true;
          }

          const content = (editor.storage as any).markdown.getMarkdown();
          if (content.trim() && !isLoading && !disabled) {
            onSendMessage(content.trim());
            editor.commands.clearContent();
          }
          return true;
        },
        "Shift-Enter": ({ editor }) => {
          editor.commands.splitBlock();
          return true;
        },
        ArrowDown: ({ editor }) => {
          if (editor.isActive("codeBlock")) {
            const { state } = editor;
            const { $head } = state.selection;
            if ($head.parentOffset === $head.parent.content.size) {
              const after = $head.after();
              if (after >= state.doc.content.size) {
                editor.commands.insertContentAt(after, { type: "paragraph" });
              }
            }
          }
          return false;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder: "Type a message...",
        emptyEditorClass: 'is-editor-empty',
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: false,
      }),
      SmartEditorExtension,
    ],
    immediatelyRender: false,
    content: "",
    editable: !(disabled ?? false),
    editorProps: {
      attributes: {
        class: cn(
          "max-h-[150px] min-h-[44px] overflow-y-auto w-full outline-none py-3 text-base m-0 px-2",
        ),
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!(disabled ?? false));
    }
  }, [disabled, editor]);

  const handleSubmit = () => {
    if (editor) {
      const content = (editor.storage as any).markdown.getMarkdown();
      if (content.trim() && !isLoading && !disabled) {
        onSendMessage(content.trim());
        editor.commands.clearContent();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-muted/50 ring-border focus-within:ring-ring focus-within:bg-background relative flex items-end gap-2 rounded-xl p-2 ring-1 transition-all focus-within:ring-2",
        (disabled || isLoading) && "opacity-50 pointer-events-none"
      )}
      onClick={(e) => {
        if (
          e.target === containerRef.current ||
          (e.target as HTMLElement).closest(".relative.w-full") ===
          e.currentTarget.firstChild
        ) {
          editor?.commands.focus("end");
        }
      }}
    >
      <div className="relative w-full overflow-hidden flex flex-col justify-end min-h-[44px]">
        <EditorContent editor={editor} className="w-full prose-editor" />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={
          !editor?.getText().trim() || (isLoading ?? false) || (disabled ?? false)
        }
        size="icon"
        className="mb-0.5 h-10 w-10 shrink-0 rounded-lg flex-none"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}
