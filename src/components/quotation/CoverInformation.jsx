import { FileText, X } from 'lucide-react';
import Button from '../common/Button.jsx';

const inputStyle =
  'w-full border border-stone-200 rounded-lg px-3 py-2.5 bg-white text-sm text-stone-800 outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20';

export default function CoverInformation({ data, onChange }) {
  const update = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const removeFeature = (featureToRemove) => {
    const updatedFeatures = data.solutionFeatures.filter(
      (feature) => feature !== featureToRemove
    );

    update('solutionFeatures', updatedFeatures);
  };

  return (
    <div className="h-full p-4 bg-white border border-stone-200 rounded-xl">
      <h2 className="flex items-center gap-2.5 text-sm font-bold text-stone-900 m-0 mb-4">
        <FileText
          size={16}
          className="text-stone-500"
        />
        Proposal Cover Information
      </h2>

      <div className="space-y-2.5">
        <label className="grid grid-cols-1 sm:grid-cols-[105px_1fr] items-center gap-2 text-xs text-stone-600">
          <span>Product Name</span>

          <input
            className={inputStyle}
            value={data.productName}
            onChange={(event) => {
              update('productName', event.target.value);
            }}
          />
        </label>

        <label className="grid grid-cols-1 sm:grid-cols-[105px_1fr] items-center gap-2 text-xs text-stone-600">
          <span>Product Subtitle</span>

          <input
            className={inputStyle}
            value={data.productSubtitle}
            onChange={(event) => {
              update('productSubtitle', event.target.value);
            }}
          />
        </label>

        <label className="grid grid-cols-1 sm:grid-cols-[105px_1fr] items-center gap-2 text-xs text-stone-600">
          <span>Proposal Title</span>

          <input
            className={inputStyle}
            value={data.proposalTitle}
            onChange={(event) => {
              update('proposalTitle', event.target.value);
            }}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-[105px_1fr] items-start gap-2 text-xs text-stone-600">
          <span className="pt-2">
            Features
          </span>

          <div className="min-h-12 border border-stone-200 rounded-lg p-2 flex flex-wrap content-start gap-1.5">
            {data.solutionFeatures.map((feature) => (
              <span
                key={feature}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#fbf5e7] text-[#8c6723] text-[9px] font-semibold"
              >
                {feature}

                <Button variant="unstyled"
                  type="button"
                  onClick={() => {
                    removeFeature(feature);
                  }}
                  className="p-0 border-0 bg-transparent text-[#8c6723] cursor-pointer"
                >
                  <X size={10} />
                </Button>
              </span>
            ))}
          </div>
        </div>

        <label className="grid grid-cols-1 sm:grid-cols-[105px_1fr] items-center gap-2 text-xs text-stone-600">
          <span>Prepared Label</span>

          <input
            className={inputStyle}
            value={data.preparedForLabel}
            onChange={(event) => {
              update('preparedForLabel', event.target.value);
            }}
          />
        </label>

        <label className="grid grid-cols-1 sm:grid-cols-[105px_1fr] items-center gap-2 text-xs text-stone-600">
          <span>Description</span>

          <input
            className={inputStyle}
            value={data.preparedForDescription}
            onChange={(event) => {
              update('preparedForDescription', event.target.value);
            }}
          />
        </label>
      </div>
    </div>
  );
}
