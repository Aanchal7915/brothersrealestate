import useSiteInfo from "../hooks/useSiteInfo";

const PrivacyPolicy = ({ setCurrentPage }) => {
  const site = useSiteInfo();
  return (
    <div className="min-h-screen bg-white text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">Privacy Policy</h1>

        <p className="mb-6">At Brothers Realestate, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit or interact with our website.</p>

        <ol className="list-decimal ml-6 space-y-4">
          <li>
            <strong>Information We Collect</strong>
            <p className="mt-2">We may collect the following information:</p>
            <ul className="list-disc ml-6">
              <li>Name, phone number, and email address</li>
              <li>Property preferences and enquiry details</li>
              <li>Location details (if submitted through forms)</li>
              <li>Any information voluntarily shared through contact or enquiry forms</li>
            </ul>
          </li>

          <li>
            <strong>How We Use Your Information</strong>
            <p className="mt-2">We use your information for the following purposes:</p>
            <ul className="list-disc ml-6">
              <li>To respond to property enquiries and requests</li>
              <li>To provide information about our projects, services, and offers</li>
              <li>To contact you regarding site visits, bookings, or follow-ups</li>
              <li>To improve our website, services, and customer experience</li>
            </ul>
          </li>

          <li>
            <strong>Data Protection</strong>
            <p className="mt-2">We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, misuse, alteration, or disclosure.</p>
          </li>

          <li>
            <strong>Payment Security</strong>
            <p className="mt-2">Any payments, if applicable, are processed through secure third-party payment gateways. Brothers Realestate does not store your banking or card details on its servers.</p>
          </li>

          <li>
            <strong>Third-Party Services</strong>
            <p className="mt-2">We may use trusted third-party services such as CRM tools, analytics services, or marketing platforms strictly for business operations and website functionality. Your data is never sold to third parties.</p>
          </li>

          <li>
            <strong>Policy Updates</strong>
            <p className="mt-2">Brothers Realestate reserves the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon being posted on the website.</p>
          </li>

          <li>
            <strong>Contact Information</strong>
            <p className="mt-2">For any questions or concerns regarding this Privacy Policy, please contact us:</p>
            <div className="mt-3 space-y-2">
              <p><strong>Email:</strong> {site.email}</p>
              <p><strong>Phone:</strong> {site.phoneDisplay}</p>
              <p><strong>Office Address:</strong> {site.address}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
