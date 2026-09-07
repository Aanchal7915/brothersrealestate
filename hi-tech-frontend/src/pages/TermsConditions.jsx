import { FileText, ArrowLeft } from "lucide-react";
import useSiteInfo from "../hooks/useSiteInfo";

const TermsConditions = ({ setCurrentPage }) => {
  const site = useSiteInfo();
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        {/* Back Button */}
        <button
          onClick={() => setCurrentPage("home")}
          className="flex items-center gap-2 text-matte hover:text-matte mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-ivory rounded-lg">
            <FileText size={32} className="text-matte" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Terms & Conditions
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Brothers Real Estate website and services,
              operated by Brothers Real Estate, you accept and agree to
              be bound by the terms and provisions of this agreement. If you do
              not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Use of Services
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Our services are provided for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Searching and browsing property listings</li>
              <li>Submitting property enquiries</li>
              <li>Receiving property updates and notifications</li>
              <li>Accessing property-related information and resources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Responsibilities
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">You agree to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the services only for lawful purposes</li>
              <li>
                Not engage in any activity that disrupts or interferes with our
                services
              </li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Communication Consent
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By using our services and providing your contact information, you
              consent to receive communications from us via Email, WhatsApp,
              SMS, RCS, or Phone Call regarding property listings, updates,
              promotional offers, and service-related information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Property Information
            </h2>
            <p className="text-gray-600 leading-relaxed">
              All property information, images, and descriptions are provided
              for general information purposes only. While we strive to ensure
              accuracy, we do not guarantee the completeness or reliability of
              any information. Property details, prices, and availability are
              subject to change without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed">
              All content, features, and functionality on our website, including
              but not limited to text, graphics, logos, images, and software,
              are the exclusive property of Brothers Real Estate and are
              protected by copyright, trademark, and other intellectual property
              laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To the fullest extent permitted by law, Brothers Real Estate
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of or
              inability to use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Modifications to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify or replace these Terms & Conditions
              at any time. Changes will be effective immediately upon posting to
              our website. Your continued use of our services after any changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms & Conditions shall be governed by and construed in
              accordance with the laws of India. Any disputes arising from these
              terms shall be subject to the exclusive jurisdiction of the courts
              in Rohtak, Haryana.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact Information
            </h2>
            <p className="text-gray-600 leading-relaxed">
              For any questions regarding these Terms & Conditions, please
              contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> {site.email}
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> {site.phoneDisplay}
              </p>
              <div className="space-y-2 mt-2">
                <p className="text-gray-700">
                  <strong>Address:</strong> 8101 FF BOUGAINVILLEA LANE DLF PHASE 4
                </p>
                <p className="text-gray-700">
                  <strong>Office Address:</strong> {site.address}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Brothers Real Estate. All
            rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
