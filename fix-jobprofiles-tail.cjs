const fs = require('fs');
let code = fs.readFileSync('src/components/JobProfiles.tsx', 'utf-8');

const properEnding = `        </div>,
        document.body
      )}
    </div>
  );
}
`;

// Find where the Bulk Delete modal footer is
const cutIndex = code.lastIndexOf('              <button\n                type="button"\n                onClick={handleConfirmBulkDelete}');
if(cutIndex !== -1) {
    let afterCut = code.substring(cutIndex);
    const endBtn = afterCut.indexOf('</button>');
    if (endBtn !== -1) {
        // the button ends here. We just need to close the divs.
        const endStr = afterCut.substring(0, endBtn + '</button>'.length);
        const correctFooter = endStr + `
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
`;
        code = code.substring(0, cutIndex) + correctFooter;
        fs.writeFileSync('src/components/JobProfiles.tsx', code);
        console.log('Fixed tail');
    }
}
