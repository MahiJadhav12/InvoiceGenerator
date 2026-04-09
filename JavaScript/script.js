    let items = [];
    let savedInvoices = [];

    // Auto-increment invoice number using localStorage
    window.onload = function () {
      const invoiceInput = document.getElementById('invoice-no');
      let storedInvoiceNo = localStorage.getItem('invoiceCounter');

      if (!storedInvoiceNo) {
        storedInvoiceNo = 1;
      } else {
        storedInvoiceNo = parseInt(storedInvoiceNo) + 1;
      }

      invoiceInput.value = storedInvoiceNo;
      localStorage.setItem('invoiceCounter', storedInvoiceNo);

      invoiceInput.addEventListener('input', () => {
        const typedNo = parseInt(invoiceInput.value);
        if (!isNaN(typedNo)) {
          localStorage.setItem('invoiceCounter', typedNo);
        }
      });
    };

    function addItem() {
      const desc = document.getElementById('item-description').value;
      const qty = parseFloat(document.getElementById('item-quantity').value);
      const rate = parseFloat(document.getElementById('item-rate').value);
      const unit = document.getElementById('rate-unit').value;
      if (!desc || isNaN(qty) || isNaN(rate)) {
        alert("Please fill all item fields.");
        return;
      }

      const amount = qty * rate;
      items.push({ desc, qty, rate, amount, unit });

      const table = document.getElementById('invoice-items');
      const row = table.insertRow();
      row.insertCell(0).innerText = desc;
      row.insertCell(1).innerText = qty;
      row.insertCell(2).innerText = `${rate.toFixed(2)} (${unit === 'sqft' ? 'Sq. Ft.' : 'Per Piece'})`;
      row.insertCell(3).innerText = amount.toFixed(2);

      updateTotal();

      document.getElementById('item-description').value = '';
      document.getElementById('item-quantity').value = '';
      document.getElementById('item-rate').value = '';
      document.getElementById('rate-unit').value = 'sqft';
    }

    function updateTotal() {
      const total = items.reduce((sum, item) => sum + item.amount, 0);
      document.getElementById('total-amount').innerText = total.toFixed(2);
    }

    function formatDateTime(dt) {
      const date = new Date(dt);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    async function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const dateRaw = document.getElementById('date').value;
      const date = formatDateTime(dateRaw);
      const invoiceNo = document.getElementById('invoice-no').value;
      const customerName = document.getElementById('customer-name').value;
      const customerAddress = document.getElementById('customer-address').value;

      if (!dateRaw || !invoiceNo || !customerName || !customerAddress || items.length === 0) {
        alert("Please fill all invoice fields and add at least one item.");
        return;
      }

      doc.setFontSize(18);
      doc.text("Invoice", 14, 22);

      doc.setFontSize(12);
      doc.text(`Invoice No: ${invoiceNo}`, 14, 30);
      doc.text(`Date: ${date}`, 14, 38);
      doc.text(`Customer Name: ${customerName}`, 14, 46);
      doc.text(`Address: ${customerAddress}`, 14, 54);

      const rows = items.map(item => [
        item.desc,
        item.qty,
        `${item.rate.toFixed(2)} (${item.unit === 'sqft' ? 'Sq. Ft.' : 'Per Piece'})`,
        item.amount.toFixed(2)
      ]);

      doc.autoTable({
        head: [['Description', 'Quantity', 'Rate/Unit', 'Amount']],
        body: rows,
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] },
      });

      const total = items.reduce((sum, item) => sum + item.amount, 0);
      doc.text(`Total Amount: INR ${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

      doc.save(`Invoice_${invoiceNo}_${customerName}.pdf`);
    }

    function saveInvoice() {
      const dateRaw = document.getElementById('date').value;
      const date = formatDateTime(dateRaw);
      const invoiceNo = document.getElementById('invoice-no').value;
      const customerName = document.getElementById('customer-name').value;
      const customerAddress = document.getElementById('customer-address').value;

      if (!dateRaw || !invoiceNo || !customerName || !customerAddress || items.length === 0) {
        alert("Please fill all invoice fields and add at least one item.");
        return;
      }

      items.forEach(item => {
        savedInvoices.push({
          InvoiceNo: invoiceNo,
          DateTime: date,
          CustomerName: customerName,
          Address: customerAddress,
          Item: item.desc,
          Quantity: item.qty,
          Rate: `${item.rate} (${item.unit === 'sqft' ? 'Sq. Ft.' : 'Per Piece'})`,
          Amount: item.amount
        });
      });

      alert("Invoice saved! You can now download all saved invoices using 'Download Excel'.");

      items = [];
      document.getElementById('invoice-items').innerHTML = '';
      document.getElementById('total-amount').innerText = '0.00';
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-address').value = '';
      document.getElementById('date').value = '';
    }

    function downloadExcel() {
      if (savedInvoices.length === 0) {
        alert("No invoices saved yet.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(savedInvoices);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AllInvoices");

      XLSX.writeFile(workbook, `All_Saved_Invoices.xlsx`);
    }