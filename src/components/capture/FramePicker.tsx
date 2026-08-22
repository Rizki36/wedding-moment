import { Radio, RadioGroup } from "@headlessui/react";

export type Frame = { id: string; name: string | null; objectKey: string };

export function FramePicker({
  frames,
  value,
  onChange,
}: {
  frames: Frame[];
  value: string | null;
  onChange: (frameId: string | null) => void;
}) {
  if (frames.length === 0) return null;

  return (
    <div className="p-3">
      <RadioGroup
        value={value}
        onChange={onChange}
        className="flex gap-2 overflow-x-auto"
      >
        <Radio
          value={null}
          className="shrink-0 w-16 h-16 flex items-center justify-center border border-(--color-outline-variant) rounded p-1 cursor-pointer text-center text-xs text-(--color-on-surface-variant) data-checked:border-(--color-primary)"
        >
          Tanpa Bingkai
        </Radio>
        {frames.map((frame) => (
          <Radio
            key={frame.id}
            value={frame.id}
            className="shrink-0 w-16 h-16 border border-(--color-outline-variant) rounded p-1 cursor-pointer data-checked:border-(--color-primary)"
          >
            {/* `objectKey` here is a presigned GET URL resolved by the route
                loader, not a raw R2 object key — see index.tsx. */}
            <img
              src={frame.objectKey}
              alt={frame.name ?? ""}
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
