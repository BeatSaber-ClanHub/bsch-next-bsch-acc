import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComponentProps, ReactElement } from "react";

const IconCard = ({
  title,
  description,
  text,
  icon,
  size,
  ...props
}: {
  title: string;
  description: string;
  text: string;
  icon: ReactElement;
  size?: "sm" | "md" | "lg" | "xl";
} & ComponentProps<typeof Card>) => {
  const default_card_size = 300;
  const default_inner_card_size = 120;
  const _size = size ? size : "lg";

  const size_multiplier_map = {
    sm: 0.5,
    md: 0.75,
    lg: 1.0,
    xl: 1.25,
  };

  const calculated_card_pixel_size =
    size_multiplier_map[_size] * default_card_size;

  const calculated_inner_card_pixel_size =
    size_multiplier_map[_size] * default_inner_card_size;

  return (
    <Card
      style={{
        width: `${calculated_card_pixel_size}px`,
        height: `${calculated_card_pixel_size}px`,
      }}
      {...props}
    >
      <CardHeader className="sr-only">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full h-full flex items-center flex-col justify-center">
        <div
          style={{
            width: `${calculated_inner_card_pixel_size}px`,
            height: `${calculated_inner_card_pixel_size}px`,
          }}
          className={`rounded-md flex items-center justify-center overflow-hidden`}
        >
          {icon}
        </div>
        <p className="text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
};

export default IconCard;
