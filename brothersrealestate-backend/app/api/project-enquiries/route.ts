import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errorResponse";
import ProjectEnquiry from "@/models/ProjectEnquiry";
import sendEmail from "@/lib/sendEmail";
import { getEnquiryEmailTemplate, getEnquiryConfirmationEmailTemplate } from "@/lib/emailTemplate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/project-enquiries — public
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, message, specialEnquiry, budget, purpose, project } =
      await request.json();

    if (!name || !email || !phone) {
      throw new HttpError(400, "Please provide name, email, and phone");
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      throw new HttpError(400, "Please provide a valid 10-digit phone number");
    }

    const enquiry = await ProjectEnquiry.create({
      name,
      email,
      phone,
      message,
      specialEnquiry,
      budget: budget || undefined,
      purpose: purpose === "investment" || purpose === "self-use" ? purpose : undefined,
      project: project || "Shapoorji Pallonji Dualis",
    });

    const enquiryForEmail = enquiry as unknown as Parameters<typeof getEnquiryEmailTemplate>[0];
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Lead: ${name} - ${project || "Shapoorji Pallonji Dualis"}`,
        html: getEnquiryEmailTemplate(enquiryForEmail),
      });
    } catch (emailError) {
      console.error("Admin notification email failed:", emailError);
    }

    if (email) {
      try {
        await sendEmail({
          to: email,
          toName: name,
          subject: "We've received your enquiry — Brothers Real Estate",
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
