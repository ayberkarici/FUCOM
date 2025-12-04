"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types
interface Criterion {
  id: string;
  code: string;
  name: string;
  nameTR?: string;
}

interface Demographics {
  nameSurname: string;
  age: string;
  profession: string;
  gender: string;
  education: string;
}

interface PairwiseComparison {
  first: string;
  second: string;
  value: string;
}

interface FormData {
  demographics: Demographics;
  mainCriteriaOrder: Criterion[];
  economicalSubOrder: Criterion[];
  socialSubOrder: Criterion[];
  environmentalSubOrder: Criterion[];
  mainComparisons: PairwiseComparison[];
  economicalComparisons: PairwiseComparison[];
  socialComparisons: PairwiseComparison[];
  environmentalComparisons: PairwiseComparison[];
}

// Initial data
const mainCriteria: Criterion[] = [
  { id: "main-1", code: "C1", name: "Economical", nameTR: "Ekonomik" },
  { id: "main-2", code: "C2", name: "Social", nameTR: "Sosyal" },
  { id: "main-3", code: "C3", name: "Environmental", nameTR: "Çevresel" },
];

const economicalSubCriteria: Criterion[] = [
  { id: "eco-1", code: "C11", name: "Worklife", nameTR: "İş Yaşamı" },
  { id: "eco-2", code: "C12", name: "Income & Wealth", nameTR: "Gelir ve Servet" },
  { id: "eco-3", code: "C13", name: "Housing", nameTR: "Konut" },
];

const socialSubCriteria: Criterion[] = [
  { id: "soc-1", code: "C21", name: "Health", nameTR: "Sağlık" },
  { id: "soc-2", code: "C22", name: "Education", nameTR: "Eğitim" },
  { id: "soc-3", code: "C23", name: "Civic Engagement", nameTR: "Sivil Katılım" },
];

const environmentalSubCriteria: Criterion[] = [
  { id: "env-1", code: "C31", name: "Infrastructure", nameTR: "Altyapı" },
  { id: "env-2", code: "C32", name: "Safety", nameTR: "Güvenlik" },
  { id: "env-3", code: "C33", name: "Environment/Green Space", nameTR: "Çevre/Yeşil Alan" },
  { id: "env-4", code: "C34", name: "Life Satisfaction", nameTR: "Yaşam Memnuniyeti" },
];

const importanceScale = [
  { value: "WI", label: "Çok Az Önemli (WI)" },
  { value: "FI", label: "Orta Seviye Önemli (FI)" },
  { value: "EI", label: "Eşit Önemde (EI)" },
  { value: "VI", label: "Çok Önemli (VI)" },
  { value: "AI", label: "Kesinlikle Çok Önemli (AI)" },
];

// Sortable Item Component
function SortableItem({
  criterion,
  index,
}: {
  criterion: Criterion;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: criterion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg ring-2 ring-primary-500 z-50" : "shadow-sm"
      }`}
    >
      <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-semibold text-sm">
        {index + 1}
      </span>
      <div className="flex-1">
        <span className="font-medium text-gray-800">{criterion.code}</span>
        <span className="mx-2 text-gray-400">-</span>
        <span className="text-gray-600">{criterion.name}</span>
        {criterion.nameTR && (
          <span className="ml-2 text-sm text-gray-400">({criterion.nameTR})</span>
        )}
      </div>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 8h16M4 16h16"
        />
      </svg>
    </div>
  );
}

// Sortable List Component
function SortableList({
  items,
  onReorder,
  title,
}: {
  items: Criterion[];
  onReorder: (items: Criterion[]) => void;
  title: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 text-sm uppercase tracking-wide">
        {title}
      </h4>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem key={item.id} criterion={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Pairwise Comparison Component
function PairwiseComparisonRow({
  comparison,
  onChange,
}: {
  comparison: PairwiseComparison;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <span className="font-semibold text-primary-700 bg-primary-100 px-3 py-1 rounded">
          {comparison.first}
        </span>
        <span className="text-gray-500">vs</span>
        <span className="font-semibold text-primary-700 bg-primary-100 px-3 py-1 rounded">
          {comparison.second}
        </span>
      </div>
      <select
        value={comparison.value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
      >
        <option value="">Önem Derecesi Seçiniz</option>
        {importanceScale.map((scale) => (
          <option key={scale.value} value={scale.value}>
            {scale.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Generate pairwise comparisons from ordered list
function generateComparisons(items: Criterion[]): PairwiseComparison[] {
  const comparisons: PairwiseComparison[] = [];
  for (let i = 0; i < items.length - 1; i++) {
    comparisons.push({
      first: items[i].code,
      second: items[i + 1].code,
      value: "",
    });
  }
  return comparisons;
}

// Main Page Component
export default function FucomSurveyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Form state
  const [demographics, setDemographics] = useState<Demographics>({
    nameSurname: "",
    age: "",
    profession: "",
    gender: "",
    education: "",
  });

  const [mainCriteriaOrder, setMainCriteriaOrder] = useState<Criterion[]>([...mainCriteria]);
  const [economicalSubOrder, setEconomicalSubOrder] = useState<Criterion[]>([
    ...economicalSubCriteria,
  ]);
  const [socialSubOrder, setSocialSubOrder] = useState<Criterion[]>([...socialSubCriteria]);
  const [environmentalSubOrder, setEnvironmentalSubOrder] = useState<Criterion[]>([
    ...environmentalSubCriteria,
  ]);

  const [mainComparisons, setMainComparisons] = useState<PairwiseComparison[]>([]);
  const [economicalComparisons, setEconomicalComparisons] = useState<PairwiseComparison[]>([]);
  const [socialComparisons, setSocialComparisons] = useState<PairwiseComparison[]>([]);
  const [environmentalComparisons, setEnvironmentalComparisons] = useState<PairwiseComparison[]>(
    []
  );

  // Generate comparisons when moving to step 3
  const generateAllComparisons = useCallback(() => {
    setMainComparisons(generateComparisons(mainCriteriaOrder));
    setEconomicalComparisons(generateComparisons(economicalSubOrder));
    setSocialComparisons(generateComparisons(socialSubOrder));
    setEnvironmentalComparisons(generateComparisons(environmentalSubOrder));
  }, [mainCriteriaOrder, economicalSubOrder, socialSubOrder, environmentalSubOrder]);

  // Update comparison value
  const updateComparison = (
    setter: React.Dispatch<React.SetStateAction<PairwiseComparison[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => {
      const newComparisons = [...prev];
      newComparisons[index] = { ...newComparisons[index], value };
      return newComparisons;
    });
  };

  // Validation
  const validateStep1 = () => {
    return (
      demographics.nameSurname.trim() !== "" &&
      demographics.age.trim() !== "" &&
      demographics.profession.trim() !== "" &&
      demographics.gender !== "" &&
      demographics.education !== ""
    );
  };

  const validateStep3 = () => {
    const allComparisons = [
      ...mainComparisons,
      ...economicalComparisons,
      ...socialComparisons,
      ...environmentalComparisons,
    ];
    return allComparisons.every((c) => c.value !== "");
  };

  // Handle step changes
  const goToStep = (step: number) => {
    if (step === 3) {
      generateAllComparisons();
    }
    setCurrentStep(step);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateStep3()) {
      alert("Lütfen tüm ikili önem değerlendirmelerini tamamlayınız.");
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    const formData: FormData = {
      demographics,
      mainCriteriaOrder,
      economicalSubOrder,
      socialSubOrder,
      environmentalSubOrder,
      mainComparisons,
      economicalComparisons,
      socialComparisons,
      environmentalComparisons,
    };

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: `Form başarıyla gönderildi! Dosya adı: ${result.fileName}`,
        });
        setCurrentStep(4);
      } else {
        setSubmitResult({
          success: false,
          message: `Hata: ${result.error || "Bilinmeyen bir hata oluştu."}`,
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: `Bağlantı hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress indicator
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                currentStep >= step
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > step ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-24 md:w-32 lg:w-48 h-1 mx-2 rounded ${
                  currentStep > step ? "bg-primary-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Kişisel Bilgiler</span>
        <span>Sıralama</span>
        <span>İkili Önem</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-academic-dark mb-2">
            FUCOM Veri Formu
          </h1>
          <p className="text-gray-600">
            Çok Kriterli Karar Verme (MCDM) Değerlendirme Anketi
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {currentStep < 4 && <ProgressBar />}

          {/* Step 1: Demographics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  1. Adım: Değerlendirici Bilgileri
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Lütfen aşağıdaki bilgileri eksiksiz doldurunuz.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad-Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={demographics.nameSurname}
                    onChange={(e) =>
                      setDemographics({ ...demographics, nameSurname: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Adınız ve Soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yaş <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={demographics.age}
                    onChange={(e) =>
                      setDemographics({ ...demographics, age: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Yaşınız"
                    min="18"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meslek <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={demographics.profession}
                    onChange={(e) =>
                      setDemographics({ ...demographics, profession: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Mesleğiniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={demographics.gender}
                    onChange={(e) =>
                      setDemographics({ ...demographics, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eğitim Durumu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={demographics.education}
                    onChange={(e) =>
                      setDemographics({ ...demographics, education: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="İlköğretim">İlköğretim</option>
                    <option value="Lise">Lise</option>
                    <option value="Ön Lisans">Ön Lisans</option>
                    <option value="Lisans">Lisans</option>
                    <option value="Yüksek Lisans">Yüksek Lisans</option>
                    <option value="Doktora">Doktora</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => goToStep(2)}
                  disabled={!validateStep1()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Sonraki Adım →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Ranking */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  2. Adım: Sıralama Belirleme
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Kriterleri önem sırasına göre sürükleyip bırakarak sıralayınız. En
                  önemli kriter en üstte olmalıdır.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-blue-700">
                    Önce size göre en önemli kriter 1. sıraya atanır. Kriterleri
                    sürükleyerek sıralama yapabilirsiniz.
                  </p>
                </div>
              </div>

              {/* Main Criteria */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  Ana Kriterler
                </h3>
                <SortableList
                  items={mainCriteriaOrder}
                  onReorder={setMainCriteriaOrder}
                  title=""
                />
              </div>

              {/* Sub Criteria */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Alt Kriterler
                </h3>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <SortableList
                      items={economicalSubOrder}
                      onReorder={setEconomicalSubOrder}
                      title="Ekonomik (C1) Alt Kriterleri"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <SortableList
                      items={socialSubOrder}
                      onReorder={setSocialSubOrder}
                      title="Sosyal (C2) Alt Kriterleri"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <SortableList
                      items={environmentalSubOrder}
                      onReorder={setEnvironmentalSubOrder}
                      title="Çevresel (C3) Alt Kriterleri"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => goToStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Önceki Adım
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Sonraki Adım →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pairwise Comparisons */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  3. Adım: İkili Önem Belirleme
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Sıralamanıza göre oluşturulan ikili karşılaştırmalar için önem
                  derecesi seçiniz.
                </p>
              </div>

              {/* Scale Reference */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">
                  Değerlendirme Skalası:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {importanceScale.map((scale) => (
                    <div key={scale.value} className="flex items-center gap-2">
                      <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {scale.value}
                      </span>
                      <span className="text-amber-700">
                        {scale.label.replace(` (${scale.value})`, "")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Criteria Comparisons */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Ana Kriterler İkili Önem
                </h3>
                <div className="space-y-3">
                  {mainComparisons.map((comparison, index) => (
                    <PairwiseComparisonRow
                      key={`main-${index}`}
                      comparison={comparison}
                      onChange={(value) =>
                        updateComparison(setMainComparisons, index, value)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Sub Criteria Comparisons */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Alt Kriterler İkili Önem
                </h3>

                {/* Economical */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">
                    Ekonomik (C1) Alt Kriterleri
                  </h4>
                  <div className="space-y-3">
                    {economicalComparisons.map((comparison, index) => (
                      <PairwiseComparisonRow
                        key={`eco-${index}`}
                        comparison={comparison}
                        onChange={(value) =>
                          updateComparison(setEconomicalComparisons, index, value)
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Social */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">
                    Sosyal (C2) Alt Kriterleri
                  </h4>
                  <div className="space-y-3">
                    {socialComparisons.map((comparison, index) => (
                      <PairwiseComparisonRow
                        key={`soc-${index}`}
                        comparison={comparison}
                        onChange={(value) =>
                          updateComparison(setSocialComparisons, index, value)
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Environmental */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">
                    Çevresel (C3) Alt Kriterleri
                  </h4>
                  <div className="space-y-3">
                    {environmentalComparisons.map((comparison, index) => (
                      <PairwiseComparisonRow
                        key={`env-${index}`}
                        comparison={comparison}
                        onChange={(value) =>
                          updateComparison(setEnvironmentalComparisons, index, value)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              {submitResult && !submitResult.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{submitResult.message}</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => goToStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Önceki Adım
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep3()}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Formu Gönder
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && submitResult?.success && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Teşekkürler!
              </h2>
              <p className="text-gray-600 mb-4">{submitResult.message}</p>
              <p className="text-sm text-gray-500">
                Verileriniz başarıyla Google Drive&apos;a yüklendi.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>FUCOM Veri Formu - Çok Kriterli Karar Verme Anketi</p>
        </div>
      </div>
    </div>
  );
}
