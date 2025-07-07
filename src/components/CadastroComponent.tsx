import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { FormPerson } from "../types/FormPerson";
import { PersonScheme } from "../utils/PersonScheme";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./inputs/Input";
import { InputType } from "../enum/input-type";
import { Button } from "./buttons/ButtonSimple";
import api from "../services/api";
import Alert from "./alerts/alertDesktop";
import { useState } from "react";

export const CadastroComponent = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormPerson>({
    resolver: zodResolver(PersonScheme),
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"alerta" | "error" | "info" | "sucesso">("info");
  const [alertText, setAlertText] = useState("");
  const [step, setStep] = useState(1);
  // Estado para armazenar os arquivos de imagem para cada campo (ex.: "rg", "caf", "car", "rgp")
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File }>({});

  // Monitorar opções selecionadas
  const adagroOption = watch("adagroOption");
  const garantiaSafraOption = watch("garantiaSafraOption");
  const chapeuPalhaOption = watch("chapeuPalhaOption");
  const paaOption = watch("paaOption");
  const pnaeOption = watch("pnaeOption");
  const aguaOption = watch("aguaOption");


  const cancelar = () => {
    reset();
    setStep(1);
    setImageFiles({});
  };

  const showAlert = (type: "alerta" | "error" | "info" | "sucesso", text: string) => {
    setAlertType(type);
    setAlertText(text);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  const selectedClasses = watch("classe") || [];

  const nextStep = () => {
    if (selectedClasses.length === 0) {
      showAlert("alerta", "Por favor, selecione pelo menos uma opção antes de avançar.");
      return;
    }
    // Se a classe for "Outros" ou "Repartição Pública", pula o step 2 e submete diretamente
    if (selectedClasses.includes("Outros") || selectedClasses.includes("Repartição Pública")) {
      handleSubmit(onSubmit)();
    } else {
      setStep(2);
    }
  };

  // Função para voltar do step 2 para o step 1 mantendo os dados preenchidos
  const voltar = () => {
    setStep(1);
  };

  // Função que retorna uma função para armazenar o arquivo para um determinado campo
  const handleFileUploadForField = (field: string) => (file: File) => {
    setImageFiles((prev) => ({ ...prev, [field]: file }));
  };

  const onSubmit = async (data: FormPerson) => {

    const {
      adagroOption,
      garantiaSafraOption,
      garantiaSafra,
      chapeuPalhaOption,
      chapeuPalha,
      paaOption,
      paa,
      pnaeOption,
      pnae,
      aguaOption,
      ...rest
    } = data;

    const payload = {
      ...rest,
      adagro: adagroOption === "Sim" ? adagroOption : null,
      garantiaSafra: garantiaSafraOption === "Sim" ? garantiaSafra : null,
      chapeuDePalha: chapeuPalhaOption === "Sim" ? chapeuPalha : null,
      paa: paaOption === "Sim" ? paa : null,
      pnae: pnaeOption === "Sim" ? pnae : null,
      agua: aguaOption === "Sim" ? aguaOption : null,
    };


    try {
      // Cria o usuário (sem os dados de imagem)
      const response = await api.post("/users", payload);
      if (response.status === 201) {
        const userId = response.data.id;

        // Para cada campo que recebeu um arquivo, fazemos o upload da imagem
        for (const field in imageFiles) {
          const file = imageFiles[field];
          const formData = new FormData();
          formData.append("file", file);
          await api.post(`/upload/user/${userId}?type=${field}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        showAlert("sucesso", "Usuário cadastrado com sucesso!");
        reset();
        setStep(1);
        setImageFiles({});
      } else {
        showAlert("error", "Erro ao enviar o formulário");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        showAlert("alerta", "error ao cadastrar usuario");
      } else {
        console.error("Erro:", axiosError.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-6">
      <h1 className="text-5xl text-center text-black font-bold">Ficha Cadastral</h1>
      <div className="border-t-2 border-black w-full mt-6"></div>
      <div className="w-full mt-4">
        <form
          className="flex flex-col gap-6"
          onSubmit={step === 2 ? handleSubmit(onSubmit) : undefined}
        >
          {/* Step 1: Dados gerais e seleção de classe */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold">Informações Gerais</h2>
              <div className="flex flex-col justify-between lg:flex-row gap-10">
                <Input
                  type={InputType.Text}
                  placeholder="Nome"
                  label="Nome"
                  error={errors}
                  register={register}
                  name="name"
                />
                <Input
                  type={InputType.Text}
                  placeholder="Apelido"
                  label="Apelido"
                  error={errors}
                  register={register}
                  name="apelido"
                />
                <div className="flex flex-col w-2/3">
                  <label htmlFor="genero" className="text-lg font-semibold mb-2 pl-1">Gênero</label>
                  <select
                    id="genero"
                    {...register("genero")}
                    className="border rounded-lg p-3 w-full bg-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  {errors.genero && <p className="text-red-500 text-sm">{errors.genero.message}</p>}
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-10">
                <Input
                  type={InputType.CPF}
                  label="CPF"
                  error={errors}
                  register={register}
                  name="cpf"
                  placeholder="000.000.000-00"
                />
                <Input
                  type={InputType.Text}
                  placeholder="RG"
                  label="RG"
                  error={errors}
                  register={register}
                  name="rg"
                  onFileUpload={handleFileUploadForField("rg")}
                />
                <Input
                  type={InputType.Phone}
                  label="Telefone"
                  error={errors}
                  register={register}
                  name="phone"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex flex-col lg:flex-row gap-10">
                <Input
                  type={InputType.Text}
                  label="Associação"
                  error={errors}
                  register={register}
                  name="associacao"
                  placeholder="Associação"
                />
                <Input
                  type={InputType.Local}
                  label="Localidade"
                  error={errors}
                  register={register}
                  name="neighborhood"
                />
                <Input
                  type={InputType.Text}
                  placeholder="Referência"
                  label="Referência"
                  error={errors}
                  register={register}
                  name="referencia"
                />
              </div>
              <div>
                <div>

                </div>
              </div>
              <h2 className="text-2xl font-bold mt-4">Selecione a Classe</h2>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" value="Agricultor" {...register("classe")} />
                  Agricultor/a
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" value="Pescador" {...register("classe")} />
                  Pescador/a
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" value="Feirante" {...register("classe")} />
                  Feirante
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" value="Pecuarista" {...register("classe")} />
                  Pecuarista
                </label>
                <label className="flex items-center gap-2">
                  {/* Corrigido o valor para "Repartição Pública" */}
                  <input type="checkbox" value="Repartição Pública" {...register("classe")} />
                  Repartição Pública
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" value="Outros" {...register("classe")} />
                  Outros
                </label>
              </div>
              {errors.classe && <p className="text-red-500 text-sm">{errors.classe.message}</p>}
              <div className="flex w-full items-end justify-end mt-5">
                <div className="flex w-2/5 gap-8">
                  <Button
                    className="text-2xl bg-gradient-to-r from-[#E03335] to-[#812F2C]"
                    children="Cancelar"
                    variant="solid"
                    type="button"
                    onClick={cancelar}
                  />
                  <Button
                    className="text-2xl bg-gradient-to-r from-[#0E9647] to-[#165C38]"
                    children="Avançar"
                    variant="solid"
                    type="button"
                    onClick={nextStep}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Apenas as informações específicas */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold">Informações Específicas</h2>

              {selectedClasses.includes("Feirante") && (
                <div className="flex flex-col gap-6">
                  <div className="flex gap-6">
                    <div className="flex w-3/4 gap-6">
                      <Input
                        type={InputType.Number}
                        label="Quanto paga de imposto?"
                        error={errors}
                        register={register}
                        name="imposto"
                        placeholder="R$ "
                      />
                      <Input
                        type={InputType.Text}
                        label="Qual área utiliza para vender?"
                        error={errors}
                        register={register}
                        name="area"
                        placeholder=""
                      />
                      <Input
                        type={InputType.Text}
                        label="Quanto tempo é feirante?"
                        error={errors}
                        register={register}
                        name="tempo"
                        placeholder=""
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <label className="font-bold text-lg">Tem carro de mão vendendo?</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="Sim"
                            {...register("carroDeMao", { required: "Selecione uma opção" })}
                          />
                          Sim
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="Não"
                            {...register("carroDeMao", { required: "Selecione uma opção" })}
                          />
                          Não
                        </label>
                      </div>
                      {errors.carroDeMao && (
                        <p className="text-red-500 text-sm">{errors.carroDeMao.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 w-1/2 mr-4">
                    <Input
                      type={InputType.Text}
                      label="O que você vende?"
                      error={errors}
                      register={register}
                      name="produtos"
                      placeholder="Digite os produtos separados por vírgula (ex.: Bovinos, Suíno, Frutas)"
                    />
                  </div>
                </div>
              )}

              {(selectedClasses.includes("Agricultor") || selectedClasses.includes("Pescador") || selectedClasses.includes("Pecuarista")) && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col lg:flex-row gap-10 pr-2 w-full">
                    <Input
                      type={InputType.Text}
                      label="RGP"
                      error={errors}
                      register={register}
                      name="rgp"
                      placeholder="RGP"
                      onFileUpload={handleFileUploadForField("rgp")}
                    />
                    <Input
                      type={InputType.Text}
                      placeholder="GTA"
                      label="GTA"
                      error={errors}
                      register={register}
                      name="gta"
                    />
                    <Input
                      type={InputType.Text}
                      placeholder="CAF"
                      label="CAF"
                      error={errors}
                      register={register}
                      name="caf"
                      onFileUpload={handleFileUploadForField("caf")}
                    />
                    <Input
                      type={InputType.Text}
                      label="CAR"
                      error={errors}
                      register={register}
                      name="car"
                      placeholder="CAR"
                      onFileUpload={handleFileUploadForField("car")}
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-6 mt-10">
                    {/* CAD ADAGRO */}
                    <div className="flex flex-col">
                      <Input
                        type={InputType.Radio}
                        label="Possui CAD ADAGRO?"
                        error={errors}
                        register={register}
                        name="adagroOption"
                        options={["Sim", "Não"]}
                      />

                      {adagroOption === "Sim" && (
                        <div className="hidden">
                          <Input
                            type={InputType.Text}
                            label=""
                            error={errors}
                            register={register}
                            name="adagro"
                            placeholder="Ano"
                          />
                        </div>
                      )}
                    </div>

                    {/* Garantia Safra */}
                    <div className="flex flex-col">
                      <Input
                        type={InputType.Radio}
                        label="Garantia Safra?"
                        error={errors}
                        register={register}
                        name="garantiaSafraOption"
                        options={["Sim", "Não"]}
                      />
                      {garantiaSafraOption === "Sim" && (
                        <Input
                          type={InputType.Text}
                          label=""
                          error={errors}
                          register={register}
                          name="garantiaSafra"
                          placeholder="Ano"
                        />
                      )}
                    </div>

                    {/* Chapéu de Palha */}
                    <div className="flex flex-col">
                      <Input
                        type={InputType.Radio}
                        label="Chapéu de Palha?"
                        error={errors}
                        register={register}
                        name="chapeuPalhaOption"
                        options={["Sim", "Não"]}
                      />
                      {chapeuPalhaOption === "Sim" && (
                        <Input
                          type={InputType.Text}
                          label=""
                          error={errors}
                          register={register}
                          name="chapeuPalha"
                          placeholder="Ano"
                        />
                      )}
                    </div>

                    {/* PAA */}
                    <div className="flex flex-col">
                      <Input
                        type={InputType.Radio}
                        label="PAA?"
                        error={errors}
                        register={register}
                        name="paaOption"
                        options={["Sim", "Não"]}
                      />
                      {paaOption === "Sim" && (
                        <Input
                          type={InputType.Text}
                          label=""
                          error={errors}
                          register={register}
                          name="paa"
                          placeholder="Vinculação"
                        />
                      )}
                    </div>

                    {/* PNAE */}
                    <div className="flex flex-col">
                      <Input
                        type={InputType.Radio}
                        label="PNAE?"
                        error={errors}
                        register={register}
                        name="pnaeOption"
                        options={["Sim", "Não"]}
                      />
                      {pnaeOption === "Sim" && (
                        <Input
                          type={InputType.Text}
                          label=""
                          error={errors}
                          register={register}
                          name="pnae"
                          placeholder="Vinculação"
                        />
                      )}
                    </div>

                    {/* SSA ÁGUA */}
                    <div className="flex flex-col">
                      <Input
                        type={InputType.Radio}
                        label="SSA ÁGUA?"
                        error={errors}
                        register={register}
                        name="aguaOption"
                        options={["Sim", "Não"]}
                      />
                      {aguaOption === "Sim" && (
                        <div className="hidden">
                          <Input
                            type={InputType.Text}
                            label=""
                            error={errors}
                            register={register}
                            name="agua"
                            placeholder="Ano"
                          />
                        </div>


                      )}

                    </div>

                  </div>

                </div>
              )}

              <div className="flex w-full items-end justify-end mt-5">
                <div className="flex w-2/5 gap-8">
                  <Button
                    className="text-2xl bg-gradient-to-r from-[#E03335] to-[#812F2C]"
                    children="Voltar"
                    variant="solid"
                    type="button"
                    onClick={voltar}
                  />
                  <Button
                    className="text-2xl bg-gradient-to-r from-[#0E9647] to-[#165C38]"
                    children="Cadastrar"
                    variant="solid"
                    type="submit"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
    </div>
  );
};
