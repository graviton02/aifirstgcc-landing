"use client";

interface Props {
  company: {
    name: string;
    description?: string;
    website?: string;
    logo_url?: string;
    headquarters?: string;
    founded_year?: number;
    claim_status?: string;
  };
}

export function CompanyHeader({ company }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-4 mb-4">
        {company.logo_url && (
          <img src={company.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-enterprise-900">{company.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-enterprise-500">
            {company.headquarters && <span>{company.headquarters}</span>}
            {company.founded_year && <span>Founded {company.founded_year}</span>}
          </div>
        </div>
      </div>
      {company.description && (
        <p className="text-enterprise-700 leading-relaxed mb-4">{company.description}</p>
      )}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm"
        >
          Visit website
        </a>
      )}
    </div>
  );
}
