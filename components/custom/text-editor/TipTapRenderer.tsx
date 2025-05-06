"use client";
import {
  ImageNodeSchema,
  NodeType,
  TiptapSchema,
} from "@/app/validation-schemas/tiptap/schema";
import Image from "next/image";
import Link from "next/link";
import React, { JSX, ReactNode } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atelierCaveDark as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

const renderNode = (node: NodeType): JSX.Element | string | null => {
  switch (node.type) {
    case "paragraph":
      if (!node.content) {
        return (
          <p>
            <br />
          </p>
        );
      }
      return (
        <p>
          {node.content?.map((child: NodeType, index: number) => {
            return (
              <React.Fragment key={index}>
                {child === undefined ? <br /> : renderNode(child)}
              </React.Fragment>
            );
          })}
        </p>
      );

    case "text":
      // Handle marks for text nodes
      let renderedText = <span>{node.text}</span>; // Default plain text
      if (node.marks) {
        node.marks.forEach((mark: NodeType) => {
          switch (mark.type) {
            case "bold":
              renderedText = <strong>{renderedText}</strong>;
              break;
            case "italic":
              renderedText = <em>{renderedText}</em>;
              break;
            case "underline":
              renderedText = <u>{renderedText}</u>;
              break;
            case "strike":
              renderedText = <s>{renderedText}</s>;
              break;
            case "code":
              renderedText = (
                <code
                  style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    backgroundColor: "hsl(var(--muted))",
                    color: "hsl(var(--chart-5))",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    fontSize: "0.9em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {renderedText}
                </code>
              );
              break;
            case "textStyle":
              renderedText = (
                <span style={{ color: mark.attrs?.color || "inherit" }}>
                  {renderedText}
                </span>
              );
              break;
            case "link":
              renderedText = (
                <Link
                  href={mark.attrs?.href}
                  target={mark.attrs?.target || "_self"}
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  {renderedText}
                </Link>
              );
              break;
            default:
              break;
          }
        });
      }

      return renderedText;

    case "orderedList":
      return (
        <ol>
          {node.content?.map((child: NodeType, index: number) => (
            <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
          ))}
        </ol>
      );
    case "horizontalRule":
      return (
        <div className="mt-[.75rem] mb-[.75rem]">
          <Separator orientation="horizontal" />
        </div>
      );
    case "listItem":
      return (
        <li>
          {node.content?.map((child: NodeType, index: number) => (
            <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
          ))}
        </li>
      );
    case "bulletList":
      return (
        <ul>
          {node.content?.map((child: NodeType, index: number) => (
            <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
          ))}
        </ul>
      );
    case "italic":
      return (
        <em>
          {node.content?.map((child: NodeType, index: number) => (
            <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
          ))}
        </em>
      );

    case "codeBlock":
      const codeText = node.content
        ?.map((child: ReactNode) => {
          const d = renderNode(child);
          if (!d) return;
          return typeof d === "object" && "props" in d ? d.props.children : d;
        })
        .join("");
      if (node.attrs.language === "js") node.attrs.language = "javascript";
      return (
        <SyntaxHighlighter language={node.attrs.language} style={dark}>
          {codeText}
        </SyntaxHighlighter>
      );

    case "image":
      const imageNode: z.infer<typeof ImageNodeSchema> = node;
      return (
        <Image
          src={imageNode.attrs.src}
          width={imageNode.attrs.width}
          alt="custom image"
          height={imageNode.attrs.height}
        />
      );

    case "blockquote":
      return (
        <div className="flex flex-row gap-2 my-2">
          <div className="w-1 h-auto rounded-full bg-border" />
          {node.content?.map((child: NodeType, childIndex: number) => (
            <React.Fragment key={childIndex}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </div>
      );
    case "heading":
      const HeadingTag = `h${
        node.attrs?.level || 1
      }` as keyof JSX.IntrinsicElements; // Dynamically set the heading tag based on the level
      return (
        <HeadingTag className="heading-node">
          {node.content?.map((child: NodeType, childIndex: number) => (
            <React.Fragment key={childIndex}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </HeadingTag>
      );

    default:
      return null;
  }
};

const TiptapRenderer = ({
  content,
}: {
  content: z.infer<typeof TiptapSchema>;
}) => {
  return (
    <div>
      {content?.content?.map((node: unknown, index: number) => {
        return <React.Fragment key={index}>{renderNode(node)}</React.Fragment>;
      })}
    </div>
  );
};

export default TiptapRenderer;
