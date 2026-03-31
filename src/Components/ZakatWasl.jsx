import React from 'react';
import logo from '../../public/Logo.png';
import zakatWaslheader from '../../public/zakatWaslHeader.png';
import PropTypes from 'prop-types';
import zakatWaslStamp from '../../public/5etm.png';
import zakatFundWatermark from '../../public/zakat  fund.webp';

const ZakatWasl = ({
  officeName,
  officeId,
  donationDate,
  donationId,
  donationAmount,
  donationAmountInWords,
  donationPhone,
  donationName,
  donationType,
  donationNameForLover,
  paymentDescription,
}) => {
  let donationTypeText = '';

  switch (donationType) {
    case '1':
      donationTypeText = 'زكاة';
      break;
    case '2':
      donationTypeText = 'صدقة';
      break;
    case '3':
      donationTypeText = 'كفارة';
      break;
    case '4':
      donationTypeText = 'نذر';
      break;
    case '5':
      donationTypeText = 'حملة';
      break;
    case '6':
      donationTypeText = 'سلة الزكاة';
      break;
    case '7':
      donationTypeText = 'سلة الصدقة';
      break;
    case '8':
      donationTypeText = 'الأضاحي';
      break;
    case '9':
      donationTypeText = 'فدية';
      break;
    case '10':
      donationTypeText = 'التبرع لمن تحب';
      break;
    case '11':
      donationTypeText = 'زكاة الفطر';
      break;
    case '12':
      donationTypeText = 'ابراء الذمة';
      break;
    default:
      donationTypeText = 'غير محدد';
  }

  return (
    <div
      style={{
        border: '2px solid #226A6A',
        borderRadius: '1rem',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        src={zakatFundWatermark}
        alt="watermark"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '66.6667%',
          maxWidth: '520px',
          opacity: 0.1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <img
            src={zakatWaslheader}
            alt="zakatWasl"
            width={800}
            style={{ borderRadius: '3rem' }}
          />
          <img
            src={logo}
            alt="zakatWasl"
            style={{ marginLeft: '2.5rem' }}
            width={150}
          />
        </div>
        <div
          style={{
            paddingLeft: '2.5rem',
            paddingRight: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '0.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '6rem',
              }}
            >
              <ZakatWaslInput
                style={{ width: '50%', whiteSpace: 'nowrap' }}
                width="w-1/2"
                inputName="المكتب"
                inputValue={officeName}
              />
              <ZakatWaslInput
                style={{ width: '50%', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}
                width="w-1/2"
                inputName="رقم التسلسل:"
                inputValue={officeId}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '6rem',
              }}
            >
              <ZakatWaslInput
                style={{ width: '50%', whiteSpace: 'nowrap' }}
                width="w-1/2"
                inputName="التاريــــخ :"
                inputValue={donationDate}
              />
              <ZakatWaslInput
                style={{ width: '50%', justifyContent: 'flex-end', whiteSpace: 'nowrap' }}
                width="w-1/2"
                inputName="رقم العملية:"
                inputValue={donationId}
              />
            </div>
          </div>

          <ZakatWaslInput
            style={{ width: '100%' }}
            inputName="اسم : المزكي/ المتبرع"
            inputValue={donationName}
          />
          <ZakatWaslInput inputName="النوع" inputValue={donationTypeText} />
          <ZakatWaslInput inputName="القيمة" inputValue={donationAmount} />
          <ZakatWaslInput
            inputName="القيمة بالحروف"
            inputValue={donationAmountInWords}
          />
          {donationType == 10 ? (
            <ZakatWaslInput
              inputName="إسم: المتبرع له"
              inputValue={donationNameForLover}
            />
          ) : (
            <ZakatWaslInput
              inputName="الجهة: أفراد / شركات"
              inputValue="افراد"
            />
          )}
          <ZakatWaslInput inputName="رقم الهاتف" inputValue={donationPhone} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '1.5rem',
            marginTop: '1rem',
            width: '100%',
          }}
        >
          <span style={{ fontWeight: 500, color: '#226A6A' }}>الختم : </span>
          <img src={zakatWaslStamp} alt="zakatWasl" width={200} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '60%',
            background: 'linear-gradient(to top, #4e948c, #226A6A)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            borderTopLeftRadius: '200px',
            borderTopRightRadius: '200px',
            height: 'fit-content',
          }}
        >
          <span style={{ color: 'white', fontWeight: 500 }}>
            تم التحويل عن طريق منصة وصل الليبية
          </span>
          <span
            style={{
              color: 'white',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            للإستفسار والتواصل يرجى الإتصال على الرقم التالي 0920924026
          </span>
        </div>
      </div>
    </div>
  );
};

export default ZakatWasl;

const ZakatWaslInput = ({ inputName, inputValue, className, width = 'w-1/4' }) => {
  const displayValue = inputValue != null && inputValue !== '' ? inputValue : '\u00A0';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minHeight: '2.25rem',
        ...(className ? { className } : {}),
      }}
    >
      <div
        style={{
          backgroundColor: '#1d7a7a',
          color: 'white',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          borderTopRightRadius: '0.75rem',
          borderBottomRightRadius: '0.75rem',
          paddingBottom: '1.125rem',
          fontWeight: 500,
          minHeight: '2.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'right',
          width: width === 'w-1/4' ? '25%' : width === 'w-1/2' ? '50%' : '100%',
        }}
      >
        {inputName}
      </div>
      <div
        style={{
          border: '1px solid #1d7a7a',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          borderTopLeftRadius: '0.75rem',
          borderBottomLeftRadius: '0.75rem',
          width: '100%',
          minHeight: '2.25rem',
          paddingBottom: '1.125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'right',
        }}
      >
        {displayValue}
      </div>
    </div>
  );
};

ZakatWasl.propTypes = {
  officeName: PropTypes.string.isRequired,
  /** رقم التسلسل: newId (payment record id) */
  officeId: PropTypes.string.isRequired,
  donationDate: PropTypes.string.isRequired,
  /** رقم العملية: SystemReference (electronic) or newId (non-electronic) */
  donationId: PropTypes.string.isRequired,
  donationAmount: PropTypes.string.isRequired,
  donationAmountInWords: PropTypes.string.isRequired,
  donationPhone: PropTypes.string.isRequired,
  donationName: PropTypes.string.isRequired,
  donationType: PropTypes.number.isRequired,
  donationNameForLover: PropTypes.string,
  paymentDescription: PropTypes.string,
};

ZakatWaslInput.propTypes = {
  inputName: PropTypes.string.isRequired,
  inputValue: PropTypes.string,
  className: PropTypes.string,
  width: PropTypes.string,
};