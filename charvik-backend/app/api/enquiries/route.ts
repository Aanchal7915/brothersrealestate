import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import Enquiry from "@/models/Enquiry";
import Property from "@/models/Property";
import FeaturedProject from "@/models/FeaturedProject";
import sendEmail from "@/lib/sendEmail";
import { getEnquiryEmailTemplate, getEnquiryConfirmationEmailTemplate } from "@/lib/emailTemplate";

// "List With Us" (ListWithUs.jsx) reuses this endpoint but only collects a
// phone number, so it fills this placeholder in as the email — there's no
// real inbox to confirm to.
const NO_EMAIL_PLACEHOLDER = "not-provided@brothersrealestate.com";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/enquiries — public
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const {
      name,
      email,
      phone,
      message,
      specialEnquiry,
      budget,
      purpose,
      propertyId,
      featuredProjectId,
      source,
      sourceLabel,
    } = await request.json();

    if (!name || !email || !phone || !message) {
      throw new HttpError(400, "Please provide all required fields");
    }

    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new HttpError(404, "Property not found");
      }
    }

    if (featuredProjectId) {
      const project = await FeaturedProject.findById(featuredProjectId);
      if (!project) {
        throw new HttpError(404, "Featured project not found");
      }
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      throw new HttpError(400, "Please provide a valid 10-digit phone number");
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      message,
      specialEnquiry,
      budget: budget || undefined,
      purpose: purpose === "investment" || purpose === "self-use" ? purpose : undefined,
      propertyId: propertyId || null,
      featuredProjectId: featuredProjectId || null,
      source: source || "website",
      sourceLabel,
    });

    if (propertyId) {
      await enquiry.populate("propertyId", "title price city address");
    }
    if (featuredProjectId) {
      await enquiry.populate("featuredProjectId", "title price city address");
    }

    // Email failures are swallowed — the enquiry is still created (matches
    // the old behavior in enquiryController.js). The admin notification and
    // the visitor's confirmation are independent sends, so one failing
    // doesn't take the other down with it.
    const enquiryForEmail = enquiry as unknown as Parameters<typeof getEnquiryEmailTemplate>[0];
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Lead: ${name}${propertyId ? " - Property Enquiry" : " - General Enquiry"}`,
        html: getEnquiryEmailTemplate(enquiryForEmail),
      });
    } catch (emailError) {
      console.error("Admin notification email failed:", emailError);
    }

    if (email && email !== NO_EMAIL_PLACEHOLDER) {
      try {
        await sendEmail({
          to: email,
          toName: name,
          subject: "We've received your enquiry — Brothers Realestate",
          html: getEnquiryConfirmationEmailTemplate(enquiryForEmail),
        });
      } catch (emailError) {
        console.error("Enquiry confirmation email failed:", emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully. We will contact you soon!",
        data: enquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
