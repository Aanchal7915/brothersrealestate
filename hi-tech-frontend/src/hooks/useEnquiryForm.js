import { useState } from "react";
import api from "../utils/api";
import trackEvent from "../utils/trackEvent";

/**
 * Shared enquiry-form state, validation and submission.
 * Both the Contact page and the homepage contact section use this so the
 * validation rules and the POST /enquiries contract live in one place.
 */
export default function useEnquiryForm({
  source = "website",
  sourceLabel = "Website enquiry",
} = {}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    budget: "",
    purpose: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};

    if (!formData.name.trim()) next.name = "Name is required";

    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      next.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      next.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.message.trim()) next.message = "Message is required";

    if (!consent) {
      next.consent =
        "You must agree to the Terms & Conditions and Privacy Policy";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/enquiries", {
        ...formData,
        budget: formData.budget || undefined,
        purpose: formData.purpose || undefined,
        source,
        sourceLabel,
      });
      setSubmitted(true);
      trackEvent("enquiry_submit", { source, source_label: sourceLabel });
      setFormData({ name: "", email: "", phone: "", message: "", budget: "", purpose: "" });
      setConsent(false);
      setErrors({});
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error("Error submitting enquiry:", error);
    }
    setLoading(false);
  };

  return {
    formData,
    setField,
    consent,
    setConsent,
    errors,
    loading,
    submitted,
    handleSubmit,
  };
}
