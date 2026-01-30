"use client";

import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { X } from "@untitledui/icons";
import { useState, type FC } from "react";

interface LndConnectionData {
    host: string;
    cert: string;
    macaroon: string;
}

interface ConnectLndModalProps {
    onConnect: (data: LndConnectionData) => void;
    trigger?: React.ReactNode;
}

export const ConnectLndModal: FC<ConnectLndModalProps> = ({
    onConnect,
    trigger,
}) => {
    const [host, setHost] = useState("");
    const [cert, setCert] = useState("");
    const [macaroon, setMacaroon] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        onConnect({ host, cert, macaroon });
        setIsOpen(false);
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            {trigger || <Button>Connect to LND Node</Button>}
            <ModalOverlay>
                <Modal className="max-w-lg">
                    <Dialog>
                        <div className="flex flex-col gap-6 rounded-xl border border-primary bg-primary p-6 shadow-xl">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-lg font-semibold text-primary">
                                        Connect to LND Node
                                    </h2>
                                    <p className="text-sm text-secondary">
                                        Enter your LND node connection details
                                    </p>
                                </div>
                                <ButtonUtility
                                    icon={X}
                                    size="sm"
                                    color="tertiary"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close"
                                />
                            </div>

                            {/* Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-5"
                            >
                                <Input
                                    label="Host"
                                    placeholder="localhost:10009"
                                    value={host}
                                    onChange={setHost}
                                    isRequired
                                    hint="The gRPC host and port of your LND node"
                                />

                                <Input
                                    label="TLS Certificate"
                                    placeholder="Hex encoded TLS certificate"
                                    value={cert}
                                    onChange={setCert}
                                    isRequired
                                    hint="The TLS certificate for secure connection"
                                />

                                <Input
                                    label="Macaroon"
                                    placeholder="Hex encoded macaroon"
                                    value={macaroon}
                                    onChange={setMacaroon}
                                    isRequired
                                    hint="The authentication macaroon"
                                />

                                {/* Footer with actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        color="secondary"
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button color="primary" type="submit">
                                        Connect
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};
