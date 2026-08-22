import { Radio, RadioGroup } from "@headlessui/react";
import { useEffect } from "react";
import { Button } from "#/components/ui/Button";

type Frame = { id: string; name: string | null; objectKey: string };

export function FramePicker({
  frames,
  value,
  onChange,
  onSkip,
}: {
  frames: Frame[];
  value: string | null;
  onChange: (frameId: string | null) => void;
  onSkip: () => void;
}) {
  // `onSkip` mutates parent state, so it must run as an effect, not during
  // render — calling it synchronously in the render body (the pre-Task-20
  // shape of this component) works today but violates React's render-purity
  // rules and emits a dev-mode warning.
  useEffect(() => {
    if (frames.length === 0) onSkip();
  }, [frames, onSkip]);

  if (frames.length === 0) return null;

  return (
    <div className="p-6">
      <h2 className="font-(--font-display) text-xl text-(--color-on-surface) mb-4">
        Pilih Bingkai (opsional)
      </h2>
      <RadioGroup
        value={value}
        onChange={onChange}
        className="grid grid-cols-3 gap-3"
      >
        {frames.map((frame) => (
          <Radio
            key={frame.id}
            value={frame.id}
            className="border border-(--color-outline-variant) rounded p-2 cursor-pointer data-checked:border-(--color-primary)"
          >
            {/* `objectKey` here is a presigned GET URL resolved by the route
                loader, not a raw R2 object key — see index.tsx. */}
            <img
              src={frame.objectKey}
              alt={frame.name ?? ""}
              crossOrigin="anonymous"
            />
          </Radio>
        ))}
      </RadioGroup>
      <Button type="button" variant="outline" onClick={onSkip} className="mt-4">
        Tanpa Bingkai
      </Button>
    </div>
  );
}
