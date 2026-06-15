import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { BranchEnquiryForm } from "../forms/BranchEnquiryForm";

interface BranchEnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchName?: string;
    courses?: string[];
    branches?: { name: string; courses?: string[] }[];
}

export function BranchEnquiryModal({
    isOpen,
    onClose,
    branchName = "",
    courses = [],
    branches = [],
}: BranchEnquiryModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Enquire Now {branchName && branches.length === 0 ? `- ${branchName}` : ""}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <BranchEnquiryForm
                        branchName={branchName}
                        courses={courses}
                        branches={branches}
                        onSuccess={onClose}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
