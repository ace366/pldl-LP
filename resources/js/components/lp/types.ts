export type LpSettings = {
    lineConsultUrl: string;
    documentRequestUrl: string;
    fvCtaText: string;
    campaignText: string;
    showInitialFeeZero: boolean;
    showSupportFree: boolean;
    receptionClosed: boolean;
    receptionClosedMsg: string;
    gaMeasurementId: string;
    gscVerification: string;
    privacyPolicy: string;
    pamphletUrl: string;
    contactEndpoint: string;
    lineLoginEnabled: boolean;
    lineRedirectUrl: string;
    lineProfile: LineProfile | null;
    lineError: string | null;
};

export type LineProfile = {
    user_id?: string;
    name?: string;
    email?: string | null;
};
