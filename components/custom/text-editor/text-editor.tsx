"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import BulletList from "@tiptap/extension-bullet-list";
import CharacterCount from "@tiptap/extension-character-count";
import Heading, { Level } from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Placeholder from "@tiptap/extension-placeholder";
import { default as TipTapStrikePlugin } from "@tiptap/extension-strike";
import TextAlign from "@tiptap/extension-text-align";
import { default as TipTapUnderlinePlugin } from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  MoveHorizontal,
  Strikethrough,
  Underline,
} from "lucide-react";
import { MouseEventHandler, ReactElement, useEffect, useState } from "react";

const TextEditor = ({ wordLimit = 300 }: { wordLimit?: number }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      TipTapUnderlinePlugin,
      TipTapStrikePlugin,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Cube or not to cube...",
        showOnlyWhenEditable: true,
      }),
      CharacterCount.configure({
        limit: wordLimit,
      }),
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "list-item",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal",
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "outline-none lg:min-h-[calc(300px-94px)] overflow-y-auto bg-red-500",
      },
    },
  });

  if (!editor) return;
  return (
    <div className="border-[1px] rounded-md border-border w-full min-w-[250px] h-full flex flex-col relative max-h-[300px] min-h-[300px]">
      <div className="px-4 py-2">
        <ToolBar editor={editor} />
      </div>
      <div className="flex-grow h-auto px-4 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="border-t-[1px] border-t-border px-4 h-[40px] items-center flex flex-row justify-end">
        <Footer editor={editor} wordLimit={wordLimit} />
      </div>
    </div>
  );
};

const Footer = ({
  editor,
  wordLimit,
}: {
  editor: Editor;
  wordLimit: number;
}) => {
  return (
    <div className="w-full border-t-[1px] border-t-border px-4 h-[40px] items-center flex flex-row justify-end">
      <p className="text-muted-foreground text-sm">
        {editor.storage.characterCount.characters()}
        {" / "}
        {wordLimit}
      </p>
    </div>
  );
};

interface Action {
  id: string;
  tiptap_name: string | Record<string | symbol | number, unknown>;
  icon: ReactElement;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: unknown;
}

interface ActionGroup {
  name: string;
  actions: Action[];
}

const ToolBar = ({ editor }: { editor: Editor }) => {
  const actions: ActionGroup[] = [
    {
      name: "Formatting",
      actions: [
        {
          id: "Bold",
          tiptap_name: "bold",
          icon: <Bold />,
          onClick: () => editor.chain().focus().toggleBold().run(),
          disabled: () => !editor.can().chain().focus().toggleBold().run(),
        },
        {
          id: "Italic",
          tiptap_name: "italic",
          icon: <Italic />,
          onClick: () => editor.chain().focus().toggleItalic().run(),
          disabled: () => !editor.can().chain().focus().toggleItalic().run(),
        },
        {
          id: "Underline",
          tiptap_name: "underline",
          icon: <Underline />,
          onClick: () => editor.chain().focus().toggleUnderline().run(),
          disabled: () => !editor.can().chain().focus().toggleUnderline().run(),
        },
        {
          id: "Strike Through",
          tiptap_name: "strike",
          icon: <Strikethrough />,
          onClick: () => editor.chain().focus().toggleStrike().run(),
          disabled: () => !editor.can().chain().focus().toggleStrike().run(),
        },
      ],
    },
    {
      name: "Alignment",
      actions: [
        {
          id: "Left Align",
          tiptap_name: "left",
          icon: <AlignLeft />,
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
        },
        {
          id: "Center Align",
          tiptap_name: "center",
          icon: <AlignCenter />,
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
        },
        {
          id: "Right Align",
          tiptap_name: "right",
          icon: <AlignRight />,
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
        },
        {
          id: "Justify",
          tiptap_name: "justify",
          icon: <AlignJustify />,
          onClick: () => editor.chain().focus().setTextAlign("justify").run(),
        },
      ],
    },
    {
      name: "Other",
      actions: [
        {
          id: "Horizontal Rule",
          icon: <MoveHorizontal />,
          tiptap_name: "horizontalRule",
          onClick: () => editor.chain().focus().setHorizontalRule().run(),
          disabled: () =>
            !editor.can().chain().focus().setHorizontalRule().run(),
        },
        {
          id: "Ordered List",
          icon: <ListOrdered />,
          tiptap_name: "orderedList",
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          disabled: () =>
            !editor.can().chain().focus().toggleOrderedList().run(),
        },
        {
          id: "List Item",
          icon: <List />,
          tiptap_name: "bulletList",
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          disabled: () =>
            !editor.can().chain().focus().toggleBulletList().run(),
        },
      ],
    },
  ];
  return (
    <div className="flex flex-wrap gap-4">
      {actions.map((group) => {
        return (
          <div key={group.name} className="flex flex-wrap gap-2">
            {group.actions.map((action) => {
              return (
                <Toggle
                  key={action.id}
                  onClick={action.onClick}
                  pressed={editor?.isActive(action.tiptap_name)}
                >
                  {action.icon}
                </Toggle>
              );
            })}
            <Separator orientation="vertical" />
          </div>
        );
      })}
      <HeadingSelect editor={editor} />
    </div>
  );
};

const HeadingSelect = ({ editor }: { editor: Editor }) => {
  const [selectedHeading, setSelectedHeading] = useState("");

  useEffect(() => {
    const updateHeading = () => {
      if (editor.isActive("heading", { level: 1 })) {
        setSelectedHeading("1");
      } else if (editor.isActive("heading", { level: 2 })) {
        setSelectedHeading("2");
      } else if (editor.isActive("heading", { level: 3 })) {
        setSelectedHeading("3");
      } else {
        setSelectedHeading("");
      }
    };

    editor.on("update", updateHeading);
    editor.on("selectionUpdate", updateHeading);

    return () => {
      editor.off("update", updateHeading);
      editor.off("selectionUpdate", updateHeading);
    };
  }, [editor]);

  return (
    <Select
      value={selectedHeading}
      onValueChange={(value: string) => {
        setSelectedHeading(value);
        editor
          .chain()
          .focus()
          .toggleHeading({ level: parseInt(value) as number as Level })
          .run();
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Headings" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1" className="text-2xl font-bold my-2">
          Heading 1
        </SelectItem>
        <SelectItem value="2" className="text-xl font-semibold my-2">
          Heading 2
        </SelectItem>
        <SelectItem value="3" className="text-lg font-medium my-2">
          Heading 3
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TextEditor;
